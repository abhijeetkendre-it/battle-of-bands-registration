/**
 * GOOGLE APPS SCRIPT FOR BATTLE OF BANDS REGISTRATION
 * (Dynamic Headers + Email Confirmation)
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Save the script (Ctrl+S).
 * 5. Run "testEmail" function first to grant Gmail + Sheets permissions.
 * 6. Click "Deploy" > "Manage deployments" > Edit (pencil icon) > 
 *    Change version to "New version" > Click "Deploy".
 *    *** IMPORTANT: You must create a NEW VERSION every time you change the code ***
 */

function doPost(e) {
  try {
    // Parse the incoming JSON request body
    var rawBody = e.postData ? e.postData.contents : null;
    if (!rawBody) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No POST body received."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(rawBody);

    // Validate email exists
    if (!data.email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Email address is missing from submitted data."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get active sheet
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSpreadsheet.getSheetByName("Registrations") || activeSpreadsheet.getSheets()[0];
    
    // Get header row to dynamically map column headers
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var headerMap = {};
    headers.forEach(function(header, index) {
      headerMap[header.trim().toLowerCase()] = index + 1;
    });
    
    var nextRow = sheet.getLastRow() + 1;
    
    // Define mappings corresponding to Google Sheet headers
    var mappings = [
      { name: 'timestamp', val: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) },
      { name: 'email address', val: data.email },
      { name: 'full name', val: data.fullName },
      { name: 'mobile no.', val: data.mobile },
      { name: 'email', val: data.email },
      { name: 'college name', val: data.college },
      { name: 'department / branch / year', val: data.deptBranchYear },
      { name: 'join the official whatsapp group link', val: data.joinedWhatsapp ? 'Yes' : 'No' },
      { name: 'how did you hear about this event?', val: data.referralSource },
      { name: 'copy requested', val: data.sendCopy ? 'Yes' : 'No' }
    ];
    
    // Write values to dynamically matched columns
    mappings.forEach(function(mapping) {
      var colIndex = headerMap[mapping.name.toLowerCase()];
      if (colIndex) {
        sheet.getRange(nextRow, colIndex).setValue(mapping.val);
      }
    });
    
    // ── Automatically send confirmation email ──
    var emailSent = false;
    var emailError = null;
    try {
      sendConfirmationEmail(data);
      emailSent = true;
    } catch (mailErr) {
      // Capture exact error so client can see what went wrong
      emailError = mailErr.toString();
    }
    
    // Return success response to the client
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      registeredEmail: data.email,
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

// Health check - open your deployed Web App URL in a browser to confirm it is live
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "OK",
    message: "Battle of Bands Registration API is running.",
    timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendConfirmationEmail(data) {
  var subject = "Registration Confirmed: Battle of Bands - Music Night with Lyria";
  var whatsappLink = "https://chat.whatsapp.com/BTyHVmOoSBrKuplPGNDimx";
  var senderName = "Abhijeet Kendre (GSA)";
  
  var emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #fcfcfc;">
      <div style="background-color: #e69d78; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">BATTLE OF BANDS</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Registration Confirmation</p>
      </div>
      
      <div style="padding: 25px; color: #333333; line-height: 1.6;">
        <p>Hi <strong>${data.fullName}</strong>,</p>
        
        <p style="font-size: 16px;"><strong>&#x2705; Registration Successful!</strong></p>
        <p>You have taken the first step toward leveling up your career with Gemini AI.</p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 5px 0; color: #856404;">&#x26A0; CRITICAL NEXT STEP:</h4>
          <p style="margin: 0; font-size: 14px;">To receive the live Google Meet link, session updates, and resource materials, you <strong>MUST</strong> join our official WhatsApp Event Hub immediately.</p>
          <p style="margin: 10px 0 0 0;"><a href="${whatsappLink}" style="display: inline-block; background-color: #25d366; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Join WhatsApp Group</a></p>
        </div>
        
        <h3 style="border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; color: #e69d78;">&#x1F4C5; Event Details</h3>
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
        <h3 style="border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; color: #e69d78;">&#x1F4CB; Your Submitted Details</h3>
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
        <p style="margin-top: 30px;">See you inside the session! &#x1F680;</p>
        <p style="margin-bottom: 0;">Best regards,<br><strong>${senderName}</strong></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #e0e0e0;">
        This is an automated confirmation for your registration. If you did not register, please contact the host.
      </div>
    </div>
</body>
</html>
  `;
  
  GmailApp.sendEmail(data.email, subject, "", {
    htmlBody: emailContent,
    name: senderName
  });
}

function testEmail() {
  sendConfirmationEmail({
    email: "theabhijeetkendre@gmail.com",
    fullName: "Abhijeet Kendre",
    sendCopy: true,
    mobile: "918605168653",
    college: "MGM's College of Engineering",
    deptBranchYear: "CSE / 4th Year",
    joinedWhatsapp: true,
    referralSource: "Social Media (Instagram/LinkedIn)"
  });
}
