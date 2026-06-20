const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const exceljs = require('exceljs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const excelFilePath = path.join(dataDir, 'registrations.xlsx');

// Helper to initialize Excel file with headers if it doesn't exist
async function initExcelFile() {
  if (!fs.existsSync(excelFilePath)) {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Email address', key: 'emailAddress', width: 25 },
      { header: 'Full Name', key: 'fullName', width: 20 },
      { header: 'Mobile No.', key: 'mobile', width: 15 },
      { header: 'Email', key: 'emailSecond', width: 25 },
      { header: 'College Name', key: 'college', width: 30 },
      { header: 'Department / Branch / Year', key: 'deptBranchYear', width: 25 },
      { header: 'Join the Official Whatsapp Group Link', key: 'joinedWhatsapp', width: 35 },
      { header: 'How did you hear about this event?', key: 'referralSource', width: 35 },
      { header: 'Copy Requested', key: 'copyRequested', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE69D78' } // Peach accent color matching the form
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    await workbook.xlsx.writeFile(excelFilePath);
    console.log('Excel spreadsheet initialized at:', excelFilePath);
  }
}

// Add registration to Excel sheet
async function appendToExcel(data) {
  await initExcelFile();
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  const worksheet = workbook.getWorksheet('Registrations');

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

  worksheet.addRow([
    timestamp,
    data.email, // Email address (Col B)
    data.fullName, // Full Name (Col C)
    data.mobile, // Mobile No. (Col D)
    data.email, // Email (Col E)
    data.college, // College Name (Col F)
    data.deptBranchYear, // Department / Branch / Year (Col G)
    data.joinedWhatsapp ? 'Yes' : 'No', // Join the Official Whatsapp Group Link (Col H)
    data.referralSource, // How did you hear about this event? (Col I)
    data.sendCopy ? 'Yes' : 'No' // Copy Requested (Col J)
  ]);

  await workbook.xlsx.writeFile(excelFilePath);
  console.log('Successfully appended registration for:', data.email);
}

// Send email using nodemailer
async function sendConfirmationEmail(data) {
  // Check if SMTP details are configured
  if (
    !process.env.SMTP_USER || 
    process.env.SMTP_USER === 'your-email@gmail.com' || 
    !process.env.SMTP_PASS || 
    process.env.SMTP_PASS === 'your-app-password'
  ) {
    console.warn('SMTP configuration is missing or using placeholder values. Skipping email dispatch.');
    return { success: false, reason: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const senderName = process.env.SENDER_NAME || 'Abhijeet Kendre (GSA)';
  const whatsappLink = process.env.WHATSAPP_LINK || 'https://chat.whatsapp.com/BTyHVmOoSBrKupIPGNDimx';

  let emailContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #fcfcfc;">
      <div style="background-color: #e69d78; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">BATTLE OF BANDS</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Registration Confirmation</p>
      </div>
      
      <div style="padding: 25px; color: #333333; line-height: 1.6;">
        <p>Hi <strong>${data.fullName}</strong>,</p>
        
        <p style="font-size: 16px;">🎉 <strong>Registration Successful!</strong></p>
        <p>You have taken the first step toward leveling up your career with Gemini AI.</p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 5px 0; color: #856404;">⚠️ CRITICAL NEXT STEP:</h4>
          <p style="margin: 0; font-size: 14px;">To receive the live Google Meet link, session updates, and resource materials, you <strong>MUST</strong> join our official WhatsApp Event Hub immediately.</p>
          <p style="margin: 10px 0 0 0;"><a href="${whatsappLink}" style="display: inline-block; background-color: #25d366; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Join WhatsApp Group</a></p>
        </div>
        
        <h3 style="border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; color: #e69d78;">📅 Event Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Event:</td>
            <td style="padding: 6px 0;">Battle of Bands - Music Night with Lyria</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Date:</td>
            <td style="padding: 6px 0;">To Be Announced</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Time:</td>
            <td style="padding: 6px 0;">7:00 PM IST</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Requirement:</td>
            <td style="padding: 6px 0;">Keep camera turned ON during live session to qualify for Google Student Ambassador Certificate of Participation.</td>
          </tr>
        </table>
  `;

  // If copy is requested, append submission details
  if (data.sendCopy) {
    emailContent += `
        <h3 style="border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; color: #e69d78;">📋 Your Submitted Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: #f9f9f9; border-radius: 4px;">
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 150px;">College Name:</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee;">${data.college}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee; font-weight: bold;">Dept / Branch / Year:</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee;">${data.deptBranchYear}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee; font-weight: bold;">Mobile No:</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee;">${data.mobile}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee; font-weight: bold;">WhatsApp Joined:</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee;">${data.joinedWhatsapp ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Referral Source:</td>
            <td style="padding: 8px 12px;">${data.referralSource}</td>
          </tr>
        </table>
    `;
  }

  emailContent += `
        <p style="margin-top: 30px;">See you inside the session! 🚀🤖</p>
        <p style="margin-bottom: 0;">Best regards,<br><strong>${senderName}</strong></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #e0e0e0;">
        This is an automated confirmation for your registration. If you did not register, please contact the host.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${senderName}" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: `Registration Confirmed: Battle of Bands - Music Night with Lyria`,
    html: emailContent
  };

  await transporter.sendMail(mailOptions);
  console.log('Confirmation email successfully sent to:', data.email);
  return { success: true };
}

// Forward data to Google Sheets Apps Script Web App
async function sendToGoogleSheets(data) {
  const url = process.env.GOOGLE_SHEET_WEBAPP_URL;
  if (!url || url.trim() === '') {
    console.warn('Google Sheets Web App URL is not configured. Skipping live sheet synchronization.');
    return { success: false, reason: 'URL not configured' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Google Sheets HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result && result.success) {
      console.log('Successfully synchronized registration to Google Sheets.');
      return { success: true };
    } else {
      throw new Error(result.error || 'Google Apps Script returned success=false');
    }
  } catch (err) {
    console.error('Google Sheets Synchronization Error:', err.message);
    return { success: false, error: err.message };
  }
}

// POST route for Registration
app.post('/api/register', async (req, res) => {
  const { email, fullName, mobile, college, deptBranchYear, joinedWhatsapp, referralSource, sendCopy } = req.body;

  // Server-side validation
  if (!email || !fullName || !mobile || !college || !deptBranchYear || !joinedWhatsapp || !referralSource) {
    return res.status(400).json({ error: 'All required fields must be completed.' });
  }

  try {
    const registrationData = {
      email,
      fullName,
      mobile,
      college,
      deptBranchYear,
      joinedWhatsapp: joinedWhatsapp === true || joinedWhatsapp === 'true' || joinedWhatsapp === 'Yes',
      referralSource,
      sendCopy: sendCopy === true || sendCopy === 'true'
    };

    // 1. Log to Excel
    await appendToExcel(registrationData);

    // 2. Send email (async background, don't block the HTTP response if SMTP takes time or fails)
    let emailStatus = { success: true };
    try {
      emailStatus = await sendConfirmationEmail(registrationData);
    } catch (emailErr) {
      console.error('Nodemailer Error:', emailErr);
      emailStatus = { success: false, error: emailErr.message };
    }

    // 3. Sync with Google Sheets (async background)
    let googleSheetsStatus = { success: true };
    try {
      googleSheetsStatus = await sendToGoogleSheets(registrationData);
    } catch (sheetErr) {
      console.error('Google Sheets Sync Error:', sheetErr);
      googleSheetsStatus = { success: false, error: sheetErr.message };
    }

    res.status(200).json({
      success: true,
      message: 'Registration logged successfully.',
      emailStatus: emailStatus,
      googleSheetsStatus: googleSheetsStatus
    });

  } catch (err) {
    console.error('Registration processing error:', err);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});

// Serve frontend for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Run server and init database file
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    await initExcelFile();
  } catch (err) {
    console.error('Failed to initialize Excel spreadsheet:', err);
  }
});
