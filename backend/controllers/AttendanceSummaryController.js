const Attendance = require('../models/AttendanceSummary');
const AttendanceController = {
    getAttendanceSummary: (req, res) => {
        Attendance.getTotalPersonnel((err, totalResult) => {
            if (err) {
                console.error("Error fetching total personnel", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            const totalPersonnel = totalResult[0].Total;

            Attendance.getLeave((err, absentResult) => {
                if (err) {
                    console.error("Error fetching leave", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                const absentCount = absentResult[0].Count;

                Attendance.getPresent((err, presentResult) => {
                    if (err) {
                        console.error("Error fetching present", err);
                        res.status(500).json({ error: "Internal server error" });
                        return;
                    }
                    const presentCount = presentResult[0].Count;

                    res.status(200).json({
                        totalPersonnel: totalPersonnel,
                        absentCount: absentCount,
                        presentCount: presentCount
                    });
                });
            });
        });
    }
};

module.exports = AttendanceController;
