// javascript
import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function ManageAttendance() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([]);

  // Fetch departments once on mount so we can fill department names when normalizing records.
  useEffect(() => {
    axios
        .get(`${BASE_URL}/api/departments`)
        .then((response) => {
          setDepartments(Array.isArray(response.data) ? response.data : []);
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
          setDepartments([]);
        });
  }, []);

  // When date changes, load attendance records for that date.
  useEffect(() => {
    if (date) {
      fetchAttendanceRecords();
    } else {
      setAttendanceRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Helper: stable numeric sort by employee id (falls back to other ids).
  // Creates a copy of the array so original is not mutated.
  const sortByEmployeeId = (records) =>
      (Array.isArray(records) ? records.slice() : []).sort((a, b) => {
        const aId = Number(a.employee?.employee_id ?? a.employee?.id ?? a.attendance_id ?? 0) || 0;
        const bId = Number(b.employee?.employee_id ?? b.employee?.id ?? b.attendance_id ?? 0) || 0;
        return aId - bId;
      });

  // Fetch attendance records for the selected date, initialize if none exist,
  // normalize department names using the departments list, and set state using
  // the sorted array so the UI has a canonical order.
  // Note: local updates (e.g., toggling absent) should update items in-place
  // and NOT call this sorter again so the order remains stable.
  const fetchAttendanceRecords = async () => {
    if (!date) {
      alert("Please select a date first.");
      return;
    }

    setLoading(true);
    try {
      // Get existing records for the date
      const existingRes = await axios.get(`${BASE_URL}/api/attendance`, { params: { date } });
      const existing = Array.isArray(existingRes.data) ? existingRes.data : [];

      let records = existing;

      // If backend returned no records, attempt initialization endpoint
      if (existing.length === 0) {
        const initRes = await axios.post(
            `${BASE_URL}/api/attendance/initialize`,
            {},
            { params: { date } }
        );
        records = Array.isArray(initRes.data) ? initRes.data : [];
      }

      // Normalize employee.department so UI can reliably read `department.name`.
      const normalized = records.map((rec) => {
        const emp = rec.employee || {};
        let dept = emp.department;

        if (dept && typeof dept === "object") {
          // ensure dept_id numeric and try to fill missing name from departments list
          const deptId = Number(dept.dept_id ?? dept.id ?? dept.deptId ?? dept);
          dept = { ...dept, dept_id: Number.isNaN(deptId) ? dept.dept_id : deptId };
          if (!dept.name && Array.isArray(departments) && dept.dept_id != null) {
            const found = departments.find((d) => Number(d.dept_id) === Number(dept.dept_id));
            if (found) dept.name = found.name;
          }
        } else {
          // department might be an id or missing; attempt to resolve from emp.dept_id or departments list
          const candidateId = emp.dept_id ?? emp.department ?? null;
          const did = candidateId != null ? Number(candidateId) : null;
          const found = Array.isArray(departments) ? departments.find((d) => Number(d.dept_id) === did) : null;
          dept = found ? { ...found, dept_id: did } : (did ? { dept_id: did } : null);
        }

        return {
          ...rec,
          employee: { ...emp, department: dept },
        };
      });

      // Sort once by employee id and set state
      setAttendanceRecords(sortByEmployeeId(normalized));
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      alert("Failed to fetch attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleClockIn = async (attendanceId) => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/attendance/${attendanceId}/clock-in`);
      await fetchAttendanceRecords();
    } catch (error) {
      console.error("Error clocking in:", error);
      alert("Failed to clock in. Please try again.");
    }
    setLoading(false);
  };

  const handleClockOut = async (attendanceId) => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/attendance/${attendanceId}/clock-out`);
      await fetchAttendanceRecords();
    } catch (error) {
      console.error("Error clocking out:", error);
      alert("Failed to clock out. Please try again.");
    }
    setLoading(false);
  };

  const handleMarkAbsent = async (attendanceId) => {
    setLoading(true);
    try {
      console.log("Marking attendance record as absent:", attendanceId);
      const response = await axios.put(`${BASE_URL}/api/attendance/${attendanceId}/mark-absent`);
      console.log("Mark absent response:", response.data);
      await fetchAttendanceRecords();
    } catch (error) {
      console.error("Error marking absent:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      alert("Failed to mark absent. Please try again.");
    }
    setLoading(false);
  };

  const viewHistory = (employeeId) => {
    try {
      console.log("Navigating to attendance history for employee:", employeeId);
      navigate(`/attendance-history/${employeeId}`);
    } catch (error) {
      console.error("Error navigating to attendance history:", error);
      alert("Failed to view attendance history. Please try again.");
    }
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    const departmentIdFilter = filters.departmentId ? Number(filters.departmentId) : null;
    return (
        (filters.employeeId === "" ||
            record.employee.employee_id.toString().includes(filters.employeeId)) &&
        (departmentIdFilter === null ||
            Number(record.employee.department?.dept_id) === departmentIdFilter)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      ><div className="flex justify-start mb-4">
        <Link
            to="/hr-dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          ← Back to HR Dashboard
        </Link>
      </div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Manage Attendance</h2>
        </div>

        {/* Date Selection */}
        <div className="mb-8 bg-gray-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
            required
          />
        </div>

        {/* Show message if no date is selected */}
        {!date ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Please select a date to view attendance records.</p>
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                  placeholder="Filter by ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  name="departmentId"
                  value={filters.departmentId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance Records Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#aec3c1] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading attendance records...</p>
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <motion.tr
                        key={record.attendance_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.employee.employee_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.employee.first_name} {record.employee.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.employee.department?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clock_in || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clock_out || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === "present" ? "bg-green-100 text-green-800" :
                            record.status === "absent" ? "bg-red-100 text-red-800" :
                            record.status === "late" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {record.status || "Not Marked"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleClockIn(record.attendance_id)}
                              disabled={loading || record.clock_in || record.status === "absent"}
                              className={`px-3 py-1 rounded-lg text-white ${
                                record.clock_in || record.status === "absent"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-500 hover:bg-green-600"
                              } transition-colors`}
                            >
                              Clock In
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleClockOut(record.attendance_id)}
                              disabled={loading || !record.clock_in || record.clock_out || record.status === "absent"}
                              className={`px-3 py-1 rounded-lg text-white ${
                                !record.clock_in || record.clock_out || record.status === "absent"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-500 hover:bg-red-600"
                              } transition-colors`}
                            >
                              Clock Out
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleMarkAbsent(record.attendance_id)}
                              disabled={loading || record.status === "absent" || record.clock_in}
                              className={`px-3 py-1 rounded-lg text-white ${
                                record.status === "absent" || record.clock_in
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-yellow-500 hover:bg-yellow-600"
                              } transition-colors`}
                            >
                              Mark Absent
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => viewHistory(record.employee.employee_id)}
                              className="px-3 py-1 bg-[#aec3c1] text-white rounded-lg hover:bg-[#546464] transition-colors"
                            >
                              History
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No attendance records found for the selected date.</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}