import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function AttendanceHistory() {
  const { employee_id } = useParams();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!employee_id) {
        console.error("No employee ID provided");
        setError("No employee ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch employee, attendance history and departments in parallel
        const [employeeResponse, attendanceResponse, departmentsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/employees/${employee_id}`),
          axios.get(`${BASE_URL}/api/attendance/${employee_id}/history`),
          axios.get(`${BASE_URL}/api/departments`)
        ]);

        if (!employeeResponse.data) throw new Error("No employee data received");
        if (!attendanceResponse.data) throw new Error("No attendance data received");

        setEmployeeDetails(employeeResponse.data);
        setAttendanceHistory(attendanceResponse.data);
        setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employee_id]);

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading employee data...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Error</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/hr/attendance")}
                className="bg-[#aec3c1] text-white px-6 py-2 rounded hover:bg-[#546464] transition-colors"
            >
              Back to Manage Attendance
            </motion.button>
          </div>
        </div>
    );
  }

  // Resolve department name from multiple possible payload shapes:
  // - employeeDetails.department?.name (object)
  // - employeeDetails.dept_id (top-level id)
  // - employeeDetails.department (numeric id)
  const deptName = (() => {
    if (!employeeDetails) return "N/A";
    if (employeeDetails.department && typeof employeeDetails.department === "object") {
      return employeeDetails.department.name || "N/A";
    }
    const id = employeeDetails.dept_id ?? (typeof employeeDetails.department === "number" ? employeeDetails.department : null);
    if (id == null) return "N/A";
    const found = departments.find((d) => d.dept_id === id || d.dept_id === Number(id));
    return found ? found.name : "N/A";
  })();

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Details & Attendance History
            </h1>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/hr/attendance")}
                className="bg-[#aec3c1] text-white px-6 py-2 rounded hover:bg-[#546464] transition-colors"
            >
              Back to Manage Attendance
            </motion.button>
          </div>

          {employeeDetails ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Employee Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">
                      {employeeDetails.first_name} {employeeDetails.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-800">
                      {deptName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-medium text-gray-800">
                      {employeeDetails.designation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Leaves Remaining</p>
                    <p className="font-medium text-gray-800">
                      {employeeDetails.leaves || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Absences</p>
                    <p className="font-medium text-gray-800">
                      {employeeDetails.absences || 0}
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <p className="text-gray-600 mb-6">Loading employee details...</p>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Attendance Records</h2>
            {attendanceHistory.length === 0 ? (
                <p className="text-gray-600">No attendance records found.</p>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.map((record) => (
                        <motion.tr
                            key={record.attendance_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.clock_in || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.clock_out || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === "present" ? "bg-green-100 text-green-800" :
                                record.status === "absent" ? "bg-red-100 text-red-800" :
                                    record.status === "late" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800"
                        }`}>
                          {record.status || "Not Marked"}
                        </span>
                          </td>
                        </motion.tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </motion.div>
      </div>
  );
}

export default AttendanceHistory;