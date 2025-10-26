import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const departmentDesignations = {
  "HR": ["HR Officer", "Training and Development Officer", "Attendance Supervisor"],
  "Warehouse": ["Inventory Supervisor", "Dispatch Officer"],
  "Production": ["Supervisor", "Machine Operator", "Quality Inspector", "Process Technician"],
  "Finance": ["Accountant", "Billing Officer", "Audit Officer", "Financial Analyst"],
  "Sales": ["Sales Representative", "Customer Relations Officer", "Marketing Assistant"],
  "Logistics": ["Driver", "Delivery Supervisor", "Vehicle Maintenance Coordinator"]
};

export default function UpdateEmployee() {
  const { employee_id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    cnic: "",
    email: "",
    designation: "",
    address: "",
    gender: "male",
    department: { dept_id: "" }
  });

  const [departments, setDepartments] = useState([]);
  const [availableDesignations, setAvailableDesignations] = useState([]);

  useEffect(() => {
    // Fetch employee details
    axios.get(`${BASE_URL}/api/employees/${employee_id}`)
        .then((response) => {
          const employee = response.data;
          setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            date_of_birth: employee.date_of_birth,
            cnic: employee.cnic,
            email: employee.email,
            designation: employee.designation,
            address: employee.address,
            gender: employee.gender,
            department: { dept_id: employee.department?.dept_id || "" }
          });
        })
        .catch((error) => {
          console.error("Error fetching employee:", error);
          alert("Failed to fetch employee data.");
        });

    // Fetch departments
    axios.get(`${BASE_URL}/api/departments`)
        .then((response) => setDepartments(response.data))
        .catch((error) => {
          console.error("Error fetching departments:", error);
        });
  }, [employee_id]);

  // Update designations when department changes
  useEffect(() => {
    const dept = departments.find(d => d.dept_id === parseInt(formData.department.dept_id));
    if (dept) {
      const designations = departmentDesignations[dept.name] || [];
      setAvailableDesignations(designations);
    }
  }, [formData.department.dept_id, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dept_id") {
      setFormData({
        ...formData,
        department: { dept_id: parseInt(value) },
        designation: ""
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${BASE_URL}/api/employees/${employee_id}`, formData)
        .then(() => {
          alert("Employee updated successfully!");
          navigate("/hr/employees");
        })
        .catch((error) => {
          console.error("Update failed:", error);
          alert("Failed to update employee.");
        });
  };

  if (!formData.first_name) return <p className="text-center mt-10">Loading employee details...</p>;

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Update Employee</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                />
              </div>
              {/* CNIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC</label>
                <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="Enter CNIC"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                  required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                    name="dept_id"
                    value={formData.department.dept_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.name}
                      </option>
                  ))}
                </select>
              </div>
              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                >
                  <option value="">Select Designation</option>
                  {availableDesignations.map((title, index) => (
                      <option key={index} value={title}>
                        {title}
                      </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent transition-colors"
                    required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate("/hr/employees")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2 bg-[#aec3c1] text-white rounded-lg hover:bg-[#546464] transition-colors"
              >
                Update Employee
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
  );
}