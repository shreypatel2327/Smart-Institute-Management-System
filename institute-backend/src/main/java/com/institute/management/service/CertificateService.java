package com.institute.management.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.institute.management.entity.Certificate;
import com.institute.management.entity.Student;
import com.institute.management.entity.Batch;
import com.institute.management.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    CertificateRepository certificateRepository;

    public Certificate generateCertificate(Student student, Batch batch) {
        String certificateNumber = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + (System.currentTimeMillis() % 1000);
        String fileName = certificateNumber + ".pdf";
        String relativePath = "uploads/certificates/" + fileName;
        String absolutePath = Paths.get("uploads/certificates", fileName).toAbsolutePath().toString();

        // Create PDF document in Landscape
        Document document = new Document(PageSize.A4.rotate());
        try {
            PdfWriter.getInstance(document, new FileOutputStream(absolutePath));
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 32, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 18, Font.ITALIC, java.awt.Color.GRAY);
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Font.BOLD, new java.awt.Color(34, 197, 94)); // Greenish harmonized color
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 14, Font.NORMAL, java.awt.Color.BLACK);
            Font detailsFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, java.awt.Color.GRAY);

            // Add margins spacing
            document.add(new Paragraph("\n\n"));

            // Title
            Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("\n"));

            // Subtitle
            Paragraph subtitle = new Paragraph("This is proudly presented to", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(new Paragraph("\n"));

            // Student Name
            Paragraph name = new Paragraph(student.getUser().getFirstName() + " " + student.getUser().getLastName(), nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);

            document.add(new Paragraph("\n"));

            // Course Info
            Paragraph text = new Paragraph("for outstanding performance and successful completion of the course\n" 
                    + batch.getName() + "\nat Smart Institute Management Portal.", textFont);
            text.setAlignment(Element.ALIGN_CENTER);
            document.add(text);

            document.add(new Paragraph("\n\n\n"));

            // Date & Certificate Verification Code
            Paragraph details = new Paragraph("Verification Code: " + certificateNumber + "   |   Issued Date: " + LocalDate.now(), detailsFont);
            details.setAlignment(Element.ALIGN_CENTER);
            document.add(details);

            document.close();

            Certificate certificate = Certificate.builder()
                    .student(student)
                    .batch(batch)
                    .certificateType("COMPLETION")
                    .filePath(relativePath)
                    .issuedDate(LocalDate.now())
                    .certificateNumber(certificateNumber)
                    .build();

            return certificateRepository.save(certificate);

        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate PDF for student: " + student.getId(), e);
        }
    }
}
