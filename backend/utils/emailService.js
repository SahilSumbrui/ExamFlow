const axios = require('axios');

const sendMail = async (to, subject, html) => {
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return Promise.reject(new Error('Email credentials not configured'));
  }

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: 'ExamFlow',
        email: 'examflow.notifications@gmail.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent successfully to:', to, '| MessageId:', response.data.messageId);
    return response.data;
  } catch (err) {
    console.error('Brevo error:', err.response?.data || err.message);
    throw err;
  }
};

const sendWelcomeEmail = (name, email, role) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <h1 style="color:#6366f1;font-size:28px;margin-bottom:4px;">Welcome to ExamFlow!</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Your account has been created successfully.</p>
      <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;color:#0f172a;font-size:16px;">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;color:#475569;">You've successfully signed up as a <strong>${role}</strong> on ExamFlow.</p>
        <p style="margin:0;color:#475569;">You can now log in and ${role === 'STUDENT' ? 'start taking exams.' : 'start creating exams and courses.'}</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">This is an automated message from ExamFlow. Please do not reply.</p>
    </div>
  `;
  return sendMail(email, "Welcome to ExamFlow!", html);
};

const sendResultsPublishedEmail = (name, email, examTitle) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <h1 style="color:#6366f1;font-size:28px;margin-bottom:4px;">Your Results Are Ready!</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Results have been published for an exam you attempted.</p>
      <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;color:#0f172a;font-size:16px;">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;color:#475569;">The results for <strong>${examTitle}</strong> have been published.</p>
        <p style="margin:0;color:#475569;">Log in to ExamFlow to view your detailed result and performance breakdown.</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">This is an automated message from ExamFlow. Please do not reply.</p>
    </div>
  `;
  return sendMail(email, `Results Published: ${examTitle}`, html);
};

const sendPasswordChangedEmail = (name, email) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <h1 style="color:#f43f5e;font-size:28px;margin-bottom:4px;">Password Changed</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Your account password was recently changed.</p>
      <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;color:#0f172a;font-size:16px;">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;color:#475569;">Your ExamFlow account password was successfully changed.</p>
        <p style="margin:0;color:#e11d48;font-weight:bold;">If you did not make this change, please contact support immediately.</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">This is an automated message from ExamFlow. Please do not reply.</p>
    </div>
  `;
  return sendMail(email, "ExamFlow: Password Changed", html);
};

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendResultsPublishedEmail,
  sendPasswordChangedEmail
};