// Payment Integration with Razorpay

function processPayment(course, onSuccess) {
    if (!AppState.currentUser) {
        showNotification('Please login to purchase', 'error');
        window.location.hash = 'login';
        return;
    }

    const options = {
        key: "rzp_test_XXXXXXXXXXXXXXXX", // Replace with your Razorpay key
        amount: course.price * 100, // Amount in paise
        currency: "INR",
        name: "EdTech Platform",
        description: course.title,
        image: "https://your-logo-url.com/logo.png",
        handler: async function(response) {
            showLoading(true);
            
            // Verify payment
            const paymentVerified = await verifyPayment(response);
            
            if (paymentVerified) {
                // Record transaction
                await recordTransaction({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    courseId: course.id,
                    courseName: course.title,
                    amount: course.price,
                    studentId: AppState.currentUser.uid,
                    studentName: AppState.currentUser.displayName,
                    status: 'success',
                    timestamp: new Date()
                });
                
                // Update course revenue
                await FirebaseDB.updateDoc('courses', course.id, {
                    revenue: (course.revenue || 0) + course.price
                });
                
                showLoading(false);
                showNotification('Payment successful!', 'success');
                
                // Call success callback
                if (onSuccess) onSuccess();
            } else {
                showLoading(false);
                showNotification('Payment verification failed', 'error');
            }
        },
        prefill: {
            name: AppState.currentUser.displayName,
            email: AppState.currentUser.email,
            contact: AppState.currentUser.phoneNumber || ""
        },
        theme: {
            color: "#4CAF50"
        },
        modal: {
            ondismiss: function() {
                showNotification('Payment cancelled', 'info');
            }
        }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();
}

async function verifyPayment(response) {
    // Verify that the payment response contains required fields from Razorpay.
    // NOTE: Full HMAC-SHA256 signature verification MUST be done server-side
    // using your Razorpay key_secret. Client-side verification alone is NOT
    // cryptographically secure. This check validates response structure and
    // records verification status for server-side reconciliation.

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

    if (!razorpay_payment_id) {
        console.error('Payment verification failed: missing payment ID');
        return false;
    }

    if (!razorpay_signature) {
        console.error('Payment verification failed: missing signature');
        return false;
    }

    if (!razorpay_order_id) {
        console.error('Payment verification failed: missing order ID');
        return false;
    }

    // Store verification data for server-side reconciliation
    try {
        await FirebaseDB.addDoc('paymentVerifications', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            userId: AppState.currentUser.uid,
            verifiedClientSide: true,
            serverVerified: false, // To be updated by Cloud Function
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to store payment verification:', error);
    }

    return true;
}

async function recordTransaction(transactionData) {
    await FirebaseDB.addDoc('transactions', transactionData);
}

async function fetchUserTransactions() {
    if (!AppState.currentUser) return [];
    
    return await FirebaseDB.getCollection('transactions', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
}

function generateInvoice(transaction) {
    // Generate PDF invoice using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('EdTech Platform', 20, 40);
    doc.text('Your Address', 20, 45);
    doc.text('Contact: +91-XXXXXXXXXX', 20, 50);
    
    // Invoice details
    doc.text(`Invoice #: ${transaction.paymentId}`, 20, 65);
    doc.text(`Date: ${formatDate(transaction.timestamp)}`, 20, 70);
    
    // Customer details
    doc.text('Bill To:', 20, 85);
    doc.text(transaction.studentName, 20, 90);
    
    // Table
    doc.setFontSize(12);
    doc.text('Description', 20, 110);
    doc.text('Amount', 170, 110);
    doc.line(20, 112, 190, 112);
    
    doc.setFontSize(10);
    doc.text(transaction.courseName, 20, 120);
    doc.text(`₹${transaction.amount}`, 170, 120);
    
    doc.line(20, 125, 190, 125);
    doc.setFontSize(12);
    doc.text('Total:', 140, 135);
    doc.text(`₹${transaction.amount}`, 170, 135);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your purchase!', 105, 270, { align: 'center' });
    
    // Save
    doc.save(`invoice_${transaction.paymentId}.pdf`);
}
