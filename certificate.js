// Certificate Generator

async function generateCertificate(courseId) {
    if (!AppState.currentUser) return;
    
    showLoading(true);
    const course = await FirebaseDB.getDoc('courses', courseId);
    const enrollment = await FirebaseDB.getCollection('enrollments', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    const courseEnrollment = enrollment.find(e => e.courseId === courseId);
    
    if (!courseEnrollment || courseEnrollment.progress < 100) {
        showLoading(false);
        showNotification('Complete the course to get certificate', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    // Background
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setLineWidth(3);
    doc.setDrawColor(0, 123, 255);
    doc.rect(10, 10, 277, 190);
    
    // Title
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE', 148.5, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('OF COMPLETION', 148.5, 65, { align: 'center' });
    
    // Student Name
    doc.setFontSize(12);
    doc.text('This is to certify that', 148.5, 90, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(AppState.currentUser.displayName, 148.5, 105, { align: 'center' });
    
    // Course Name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed', 148.5, 120, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(course.title, 148.5, 135, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDate(new Date())}`, 148.5, 155, { align: 'center' });
    
    // Signature
    doc.setFont('helvetica', 'italic');
    doc.text('EdTech Platform', 50, 180);
    doc.text(course.teacherName, 230, 180);
    
    doc.line(40, 175, 90, 175);
    doc.line(220, 175, 270, 175);
    
    doc.setFontSize(8);
    doc.text('Platform Seal', 50, 185);
    doc.text('Instructor Signature', 230, 185);
    
    showLoading(false);
    
    // Save
    doc.save(`certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
    
    // Record certificate
    await FirebaseDB.addDoc('certificates', {
        studentId: AppState.currentUser.uid,
        courseId: courseId,
        courseName: course.title,
        issuedAt: new Date()
    });
    
    showNotification('Certificate downloaded!', 'success');
}

async function viewCertificates() {
    if (!AppState.currentUser) {
        window.location.hash = 'login';
        return;
    }
    
    const content = document.getElementById('main-content');
    const certificates = await FirebaseDB.getCollection('certificates', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    content.innerHTML = `
        <div class="certificates-page">
            <h1>My Certificates</h1>
            
            <div class="certificates-grid">
                ${certificates.length > 0 ? certificates.map(cert => `
                    <div class="certificate-card">
                        <div class="certificate-icon">🏆</div>
                        <h3>${cert.courseName}</h3>
                        <p>Issued on ${formatDate(cert.issuedAt)}</p>
                        <button onclick="regenerateCertificate('${cert.courseId}')" class="btn-download">
                            Download Certificate
                        </button>
                    </div>
                `).join('') : `
                    <div class="empty-state">
                        <p>No certificates yet</p>
                        <p>Complete courses to earn certificates</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function regenerateCertificate(courseId) {
    generateCertificate(courseId);
}
