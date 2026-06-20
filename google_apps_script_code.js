/**
 * GOOGLE APPS SCRIPT FOR BATTLE OF BANDS REGISTRATION
 * 
 * INSTRUCTIONS:
 * 1. Open the Google Sheet where you want to store registrations.
 * 2. Click Extensions > Apps Script in the top menu.
 * 3. Replace all code in Code.gs with this script.
 * 4. Save the script (Ctrl+S).
 * 5. Click the "Deploy" button at the top right > "New deployment".
 * 6. Click the gear icon next to "Select type" and select "Web app".
 * 7. Configure:
 *    - Description: Battle of Bands Backend
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone
 * 8. Click "Deploy". Authorize permissions if prompted.
 * 9. Copy the "Web app URL" and paste it in config.js as GOOGLE_SHEET_WEBAPP_URL.
 */

function doPost(e) {
  try {
    // Parse the incoming JSON request
    var data = JSON.parse(e.postData.contents);
    
    // Get active sheet
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSpreadsheet.getSheetByName("Registrations") || activeSpreadsheet.getSheets()[0];
    
    // Prepare values to write
    var timestamp = new Date();
    var emailAddress = data.email || "";
    var fullName = data.fullName || "";
    var mobile = data.mobile || "";
    var college = data.college || "";
    var deptBranchYear = data.deptBranchYear || "";
    var joinedWhatsapp = data.joinedWhatsapp ? "Yes" : "No";
    var referralSource = data.referralSource || "";
    var copyRequested = data.sendCopy ? "Yes" : "No";
    
    // Append row to Google Sheet
    sheet.appendRow([
      timestamp,       // Timestamp
      emailAddress,    // Email address (Col B)
      fullName,        // Full Name (Col C)
      mobile,          // Mobile No. (Col D)
      emailAddress,    // Email (Col E)
      college,         // College Name (Col F)
      deptBranchYear,  // Department / Branch / Year (Col G)
      joinedWhatsapp,  // Join the Official Whatsapp Group Link (Col H)
      referralSource,  // How did you hear about this event? (Col I)
      copyRequested    // Copy Requested (Col J)
    ]);
    
    // Attempt to send email
    var emailSent = false;
    var emailError = null;
    try {
      sendConfirmationEmail(data);
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.toString();
    }
    
    // Return success response to the client
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      emailSent: emailSent,
      emailError: emailError 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return failure response to the client
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data) {
  var subject = "Registration Confirmed: Battle of Bands - Music Night with Lyria";
  var whatsappLink = "https://chat.whatsapp.com/BTyHVmOoSBrKuplPGNDimx";
  var senderName = "Abhijeet Kendre (GSA)";
  
  var emailContent = `
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
            <td style="padding: 8px 12px; border-bottom: 1px solid #eeeeee;">${data.joinedWhatsapp ? "Yes" : "No"}</td>
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
  
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: emailContent,
    name: senderName
  });
}
