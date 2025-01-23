import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spin, Alert } from 'antd';
import moment from 'moment';

const PrintLeaveForm = ({ values }) => {
    const [personnelDetails, setPersonnelDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPersonnelDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/leavemanagement/personnelprint/${values.service_number}`);
                setPersonnelDetails(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch personnel details');
            } finally {
                setLoading(false);
            }
        };

        if (values && values.service_number) {
            fetchPersonnelDetails();
        }
    }, [values]);

    if (loading) return <Spin size="large" />;
    if (error) return <Alert message={error} type="error" />;
    if (!values || !personnelDetails) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        const photoUrl = `/uploads/${personnelDetails.photo}`; // Adjust path as necessary

        const printContent = `
            <html>
                <head>
                    <title>Leave Certificate</title>
                    <style>
                        body { font-family: 'Times New Roman', sans-serif; line-height: 1.4; }
                        .content { margin: 20px; }
                        .header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-start; 
                            margin-bottom: 20px; 
                        }
                        .header img { 
                            width: 100px; 
                            height: 100px; 
                            object-fit: cover; 
                            border: 1px solid #000; 
                            padding: 2px;
                        }
                        h1 { 
                            font-size: 22px; 
                            margin-top: 0;
                        }
                        .warning { 
                            font-weight: bold; 
                            margin-bottom: 20px; 
                            font-size: 14px;
                        }
                        ol { 
                            padding-left: 20px; 
                            font-size: 14px;
                        }
                        li { 
                            margin-bottom: 10px; 
                        }
                        .address-box { 
                            border: 1px solid #000; 
                            padding: 10px; 
                            margin-top: 10px; 
                        }
                        .footer { 
                            margin-top: 30px; 
                        }
                        .signature { 
                            margin-top: 50px; 
                            border-top: 1px solid #000; 
                            display: inline-block; 
                            padding-top: 10px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="content">
                        <div class="header">
                            <h1>LEAVE CERTIFICATE</h1>
                            <img src="${photoUrl}" alt="Personnel Photo" />
                        </div>
                        <p class="warning">LEAVE KE DAURAN MALERIA SE BACHAV RAKHEN, VAHAN CHALATE SAMAY SAVDHANI BARTIEN AUR BIKE CHALATE SAMAY HELMET PAHNE</p>
                        <ol>
                            <li>
                                Certified that No ${values.service_number} (${personnelDetails.rank}) ${personnelDetails.first_name} ${personnelDetails.last_name} of 31 RAJPUT
                                has been granted ${values.no_of_days} days ${values.leave_type} from ${moment(values.start_date).format('DD MMM YYYY')} 
                                to ${moment(values.end_date).format('DD MMM YYYY')} with permission to 
                                Prefix on ${values.prefix_on ? moment(values.prefix_on).format('DD MMM YYYY') : 'N/A'} and 
                                Suffix on ${values.suffix_on ? moment(values.suffix_on).format('DD MMM YYYY') : 'N/A'} being Sunday/holidays.
                            </li>
                            <li>
                                His address during the leave will be as under
                                <div class="address-box">
                                    <p>Tele No:______________ Vill:_____________ Post:_____________________</p>
                                    <p>Tehsil________________ Distt:______________ State:_____________</p>
                                    <p>NRS_____________________ PIN:_______________</p>
                                </div>
                            </li>
                            <li>He is permitted to carry ____________ bottles of liquor for his own use.</li>
                            <li>Koi bhi samasya hone par Adjt-9719650486, SM-9664012031, SA-9784920764, BN Writer 9171572090.</li>
                            <li>I Card No: ${personnelDetails.id_card_no || 'N/A'} and Blood Group: ${personnelDetails.blood_group || 'N/A'}</li>
                            <li>If in difficulty he will report to MCO/CMP. If neither is available, he will approach the stn master for assistance producing this Leave Certificate.</li>
                            <li>Kisi bhi anjan vyakti se apni pahchan ya military baaten na karen.</li>
                            <li>Apne nearest Military station main jakar apne dependent ka addhar eKyc jaroor Karwana hai.</li>
                            <li>Subject to Recall at short notice if reqd.</li>
                        </ol>
                        <div class="footer">
                            <p>Unit : 31 RAJPUT (${personnelDetails.coy} COY)</p>
                            <p>Station: C/O 56 APO</p>
                            <p>Dated: ${moment().format('DD MMM YYYY')}</p>
                            <div class="signature">Lt Col/Maj/Capt COY CDR</div>
                        </div>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="print-leave-form">
            <Button onClick={handlePrint} type="primary" className="print-button">
                Print
            </Button>
        </div>
    );
};

export default PrintLeaveForm;
