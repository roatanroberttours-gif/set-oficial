/**
 * GOOGLE APPS SCRIPT - PRIVATE TOUR BOOKING SYSTEM
 *
 * INSTALACIÓN:
 * 1. Crea un nuevo proyecto en Google Apps Script (script.google.com)
 * 2. Copia este código en el editor
 * 3. Crea una carpeta llamada "logo" en Google Drive
 * 4. Sube tu logo (logo.png) a esa carpeta
 * 5. Obtén el ID de la carpeta desde la URL de Drive
 * 6. Reemplaza FOLDER_ID_HERE con el ID de tu carpeta
 * 7. Configura los emails de admin en ADMIN_EMAILS
 * 8. Despliega como Web App (Ejecutar > Desplegar > Nueva implementación)
 * 9. Selecciona "Web app", "Ejecutar como: Yo", "Quién puede acceder: Cualquiera"
 * 10. Copia la URL generada y úsala en el frontend
 */

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
  ADMIN_EMAILS: ["roatanroberttours@gmail.com"], // Emails de administradores
  LOGO_FOLDER_ID: "FOLDER_ID_HERE", // ID de la carpeta con el logo
  LOGO_FILENAME: "logo.png", // Nombre del archivo de logo
  COMPANY_NAME: "Roatan Private Tours",
  FROM_NAME: "Roatan Tours - Booking System",
};

// ============================================
// FUNCIÓN PRINCIPAL - Web App
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Generar PDF
    const pdfBlob = generateBookingPDF(data);

    // Enviar email al cliente
    sendClientEmail(data, pdfBlob);

    // Enviar email al administrador
    sendAdminEmail(data, pdfBlob);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Booking processed successfully",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// GENERAR PDF
// ============================================

function generateBookingPDF(data) {
  try {
    // Crear documento temporal
    const doc = DocumentApp.create(
      "Tour_Booking_" + data.lastName + "_" + new Date().getTime()
    );
    const body = doc.getBody();

    // Limpiar contenido
    body.clear();

    // Obtener logo
    const logoBlob = getLogoFromDrive();

    // Insertar logo si existe
    if (logoBlob) {
      const logoImage = body.appendImage(logoBlob);
      logoImage.setWidth(200);
      logoImage.setHeight(100);
    }

    // Título
    const title = body.appendParagraph("PRIVATE TOUR BOOKING REQUEST");
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setFontSize(20);
    title.setBold(true);
    title.setSpacingAfter(20);

    // Fecha de solicitud
    const dateSubmitted = body.appendParagraph(
      "Submitted: " + new Date(data.submittedAt).toLocaleString("en-US")
    );
    dateSubmitted.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    dateSubmitted.setFontSize(10);
    dateSubmitted.setSpacingAfter(20);

    // Línea separadora
    body.appendHorizontalRule();

    // TOUR INFORMATION
    addSection(body, "TOUR INFORMATION");
    addField(body, "Tour Selected", data.tourTitle);
    if (data.requestedTourDate) {
      addField(body, "Requested Date", formatDate(data.requestedTourDate));
    }

    body.appendParagraph(""); // Espacio

    // GUEST INFORMATION
    addSection(body, "GUEST INFORMATION");
    addField(body, "Name", data.firstName + " " + data.lastName);

    if (data.hometownCity || data.hometownState || data.hometownCountry) {
      let hometown = [
        data.hometownCity,
        data.hometownState,
        data.hometownCountry,
      ]
        .filter(Boolean)
        .join(", ");
      addField(body, "Hometown", hometown);
    }

    addField(body, "Email", data.email);
    addField(body, "Phone", data.phone);
    addField(body, "Cruise Ship / Resort", data.cruiseShipOrResortName);

    body.appendParagraph(""); // Espacio

    // GROUP SIZE
    addSection(body, "GROUP SIZE");
    addField(body, "Guests (Age 5+)", data.numberOfGuestsAge5Up.toString());
    if (data.numberOfGuestsUnder5 > 0) {
      addField(
        body,
        "Children (Under 5)",
        data.numberOfGuestsUnder5.toString()
      );
    }
    const totalGuests = data.numberOfGuestsAge5Up + data.numberOfGuestsUnder5;
    addField(body, "Total Guests", totalGuests.toString());

    body.appendParagraph(""); // Espacio

    // ADDITIONAL OPTIONS
    if (
      data.selectedAdditionalOptions &&
      data.selectedAdditionalOptions.length > 0
    ) {
      addSection(body, "ADDITIONAL OPTIONS SELECTED");
      data.selectedAdditionalOptions.forEach((option, index) => {
        const optionText = body.appendParagraph(
          index + 1 + ". " + option.title
        );
        optionText.setBold(true);
        optionText.setFontSize(11);
        optionText.setSpacingBefore(5);

        if (option.subtitle) {
          const subtitle = body.appendParagraph("   " + option.subtitle);
          subtitle.setFontSize(9);
          subtitle.setItalic(true);
        }

        if (option.features) {
          const features = body.appendParagraph("   " + option.features);
          features.setFontSize(9);
          features.setSpacingAfter(8);
        }
      });

      body.appendParagraph(""); // Espacio
    }

    // COMMENTS
    if (data.comments) {
      addSection(body, "COMMENTS / SPECIAL REQUESTS");
      const commentsText = body.appendParagraph(data.comments);
      commentsText.setFontSize(10);
      commentsText.setSpacingAfter(15);
    }

    // Footer
    body.appendHorizontalRule();
    const footer = body.appendParagraph(
      "This is a booking request. Confirmation and pricing will be sent via email."
    );
    footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footer.setFontSize(9);
    footer.setItalic(true);
    footer.setForegroundColor("#666666");

    // Guardar y convertir a PDF
    doc.saveAndClose();

    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs("application/pdf");
    pdfBlob.setName(
      "Tour_Booking_" +
        data.lastName +
        "_" +
        formatDate(
          data.requestedTourDate || new Date().toISOString().split("T")[0]
        ) +
        ".pdf"
    );

    // Eliminar documento temporal
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    return pdfBlob;
  } catch (error) {
    Logger.log("Error generating PDF: " + error.toString());
    throw error;
  }
}

// ============================================
// FUNCIONES AUXILIARES PARA PDF
// ============================================

function addSection(body, title) {
  const section = body.appendParagraph(title);
  section.setFontSize(14);
  section.setBold(true);
  section.setForegroundColor("#0d9488"); // Teal color
  section.setSpacingBefore(15);
  section.setSpacingAfter(10);
}

function addField(body, label, value) {
  const field = body.appendParagraph(label + ": " + value);
  field.setFontSize(11);
  field.setSpacingAfter(5);

  // Bold label
  const text = field.editAsText();
  text.setBold(0, label.length + 1, true);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLogoFromDrive() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.LOGO_FOLDER_ID);
    const files = folder.getFilesByName(CONFIG.LOGO_FILENAME);

    if (files.hasNext()) {
      const logoFile = files.next();
      return logoFile.getBlob();
    }

    Logger.log("Logo file not found in folder");
    return null;
  } catch (error) {
    Logger.log("Error getting logo: " + error.toString());
    return null;
  }
}

// ============================================
// ENVIAR EMAIL AL CLIENTE
// ============================================

function sendClientEmail(data, pdfBlob) {
  const subject = "Tour Booking Request Received - " + data.tourTitle;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #2563eb 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Thank You for Your Booking Request!</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">Dear ${data.firstName} ${
    data.lastName
  },</p>
        
        <p style="font-size: 14px; color: #374151; line-height: 1.6;">
          Thank you for submitting your booking request for <strong>${
            data.tourTitle
          }</strong>
          ${
            data.requestedTourDate
              ? " on " + formatDate(data.requestedTourDate)
              : ""
          }.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">Your Tour is NOT Confirmed Yet</h3>
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            We will review your request and send you tour availability and pricing information soon.
          </p>
        </div>
        
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0d9488; margin-top: 0;">Booking Details:</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Tour:</strong></td>
              <td style="padding: 8px 0;">${data.tourTitle}</td>
            </tr>
            ${
              data.requestedTourDate
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${formatDate(
                data.requestedTourDate
              )}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Cruise/Resort:</strong></td>
              <td style="padding: 8px 0;">${data.cruiseShipOrResortName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Group Size:</strong></td>
              <td style="padding: 8px 0;">${
                data.numberOfGuestsAge5Up
              } adults + ${data.numberOfGuestsUnder5} children</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #dbeafe; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #1e40af;">
            <strong>📧 Important:</strong> Please check your SPAM or PROMOTIONS folder if you don't receive our response.
            Gmail users: emails may be automatically filtered to the PROMOTIONS folder.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #374151;">
          We will respond as soon as possible. Please note that internet connectivity can sometimes be challenging on Roatan, 
          so we appreciate your patience.
        </p>
        
        <p style="font-size: 14px; color: #374151;">
          A copy of your booking request is attached to this email for your records.
        </p>
        
        <p style="font-size: 14px; color: #374151; margin-top: 30px;">
          Best regards,<br>
          <strong>${CONFIG.COMPANY_NAME}</strong>
        </p>
      </div>
      
      <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} ${
    CONFIG.COMPANY_NAME
  }. All rights reserved.</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [pdfBlob],
    name: CONFIG.FROM_NAME,
  });

  Logger.log("Client email sent to: " + data.email);
}

// ============================================
// ENVIAR EMAIL AL ADMINISTRADOR
// ============================================

function sendAdminEmail(data, pdfBlob) {
  const subject =
    "🔔 NEW Tour Booking Request - " + data.lastName + " - " + data.tourTitle;

  const additionalOptionsHtml =
    data.selectedAdditionalOptions && data.selectedAdditionalOptions.length > 0
      ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #0d9488;">Additional Options Selected:</h3>
        <ul style="font-size: 14px; line-height: 1.8;">
          ${data.selectedAdditionalOptions
            .map(
              (opt) => `
            <li>
              <strong>${opt.title}</strong>
              ${
                opt.subtitle
                  ? '<br><em style="color: #6b7280;">' + opt.subtitle + "</em>"
                  : ""
              }
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `
      : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px;">
        <h1 style="margin: 0; font-size: 26px;">🔔 New Private Tour Booking Request</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Action required - Review and respond</p>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #991b1b;">⚡ New booking request received</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #7f1d1d;">
            Submitted: ${new Date(data.submittedAt).toLocaleString("en-US")}
          </p>
        </div>
        
        <table style="width: 100%; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; font-size: 14px;">
          <tr style="background-color: #f3f4f6;">
            <td colspan="2" style="padding: 12px; font-weight: bold; color: #0d9488; font-size: 16px;">
              TOUR INFORMATION
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; width: 40%; color: #6b7280;"><strong>Tour:</strong></td>
            <td style="padding: 10px;">${data.tourTitle}</td>
          </tr>
          ${
            data.requestedTourDate
              ? `
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Requested Date:</strong></td>
            <td style="padding: 10px; font-weight: bold; color: #dc2626;">${formatDate(
              data.requestedTourDate
            )}</td>
          </tr>
          `
              : ""
          }
          
          <tr style="background-color: #f3f4f6;">
            <td colspan="2" style="padding: 12px; font-weight: bold; color: #0d9488; font-size: 16px;">
              GUEST INFORMATION
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Name:</strong></td>
            <td style="padding: 10px;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Email:</strong></td>
            <td style="padding: 10px;"><a href="mailto:${
              data.email
            }" style="color: #2563eb;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Phone:</strong></td>
            <td style="padding: 10px;"><a href="tel:${
              data.phone
            }" style="color: #2563eb;">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Hometown:</strong></td>
            <td style="padding: 10px;">${
              [data.hometownCity, data.hometownState, data.hometownCountry]
                .filter(Boolean)
                .join(", ") || "N/A"
            }</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Cruise/Resort:</strong></td>
            <td style="padding: 10px; font-weight: bold;">${
              data.cruiseShipOrResortName
            }</td>
          </tr>
          
          <tr style="background-color: #f3f4f6;">
            <td colspan="2" style="padding: 12px; font-weight: bold; color: #0d9488; font-size: 16px;">
              GROUP SIZE
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Adults (5+):</strong></td>
            <td style="padding: 10px;">${data.numberOfGuestsAge5Up}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Children (Under 5):</strong></td>
            <td style="padding: 10px;">${data.numberOfGuestsUnder5}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #6b7280;"><strong>Total:</strong></td>
            <td style="padding: 10px; font-weight: bold;">${
              data.numberOfGuestsAge5Up + data.numberOfGuestsUnder5
            } guests</td>
          </tr>
        </table>
        
        ${additionalOptionsHtml}
        
        ${
          data.comments
            ? `
        <div style="margin-top: 20px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <h3 style="color: #0d9488; margin-top: 0;">Comments / Special Requests:</h3>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${data.comments}</p>
        </div>
        `
            : ""
        }
        
        <div style="margin-top: 30px; padding: 20px; background-color: #dbeafe; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: bold;">
            📎 Complete booking details are attached as PDF
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="mailto:${data.email}?subject=Re: Tour Booking - ${
    data.tourTitle
  }" 
             style="display: inline-block; padding: 12px 30px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📧 Reply to Customer
          </a>
        </div>
      </div>
      
      <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Automated notification from ${
          CONFIG.COMPANY_NAME
        } Booking System</p>
      </div>
    </div>
  `;

  CONFIG.ADMIN_EMAILS.forEach((adminEmail) => {
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody,
      attachments: [pdfBlob],
      name: CONFIG.FROM_NAME,
    });
  });

  Logger.log("Admin email sent to: " + CONFIG.ADMIN_EMAILS.join(", "));
}

// ============================================
// FUNCIÓN DE PRUEBA
// ============================================

function testEmailSystem() {
  const testData = {
    tourTitle: "Island Paradise Tour",
    firstName: "John",
    lastName: "Doe",
    hometownCity: "Miami",
    hometownState: "Florida",
    hometownCountry: "United States",
    numberOfGuestsAge5Up: 2,
    numberOfGuestsUnder5: 1,
    phone: "+1-555-0123",
    email: "test@example.com",
    cruiseShipOrResortName: "Carnival Mardi Gras",
    requestedTourDate: "2025-01-15",
    selectedAdditionalOptions: [
      {
        title: "Mayan Jungle Zipline",
        subtitle: "45 Minutes to 1 Hour: Add $45 per Participant",
        features: "Includes FREE access to Victor's Monkey & Sloth Sanctuary",
      },
    ],
    comments: "Looking forward to this adventure!",
    submittedAt: new Date().toISOString(),
  };

  try {
    const pdfBlob = generateBookingPDF(testData);
    sendClientEmail(testData, pdfBlob);
    sendAdminEmail(testData, pdfBlob);
    Logger.log("Test completed successfully!");
  } catch (error) {
    Logger.log("Test failed: " + error.toString());
  }
}
