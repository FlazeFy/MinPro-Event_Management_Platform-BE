const templateStyle = () => {
    return `
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, Helvetica, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            .header {
                padding: 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 22px;
            }
            .content {
                padding: 24px;
                color: #333333;
                line-height: 1.6;
            }
            .content p {
                margin: 0 0 16px;
            }
            .context-box {
                background-color: #f1f5f9;
                border-left: 4px solid #00c2a8;
                padding: 16px;
                border-radius: 4px;
                margin: 20px 0;
            }
            .header, .footer {
                background-color: #00c2a8;
                color: #ffffff;
                text-align: center;
            }
            .footer {
                padding: 16px;
                font-size: 12px;
            }
        </style>
    `
}

export const announcementEmailTemplate = (username: string, context: string) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Announcement</title>
            ${templateStyle()}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📢 Announcement</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>We would like to inform you that:</p>
                    <div class="context-box">
                        ${context}
                    </div>
                    <p>If you have any questions, feel free to reach out to us.</p>
                    <p>Best regards,<br/><strong>EventKu</strong></p>
                </div>
                <div class="footer">
                    © ${new Date().getFullYear()} EventKu. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `
}
