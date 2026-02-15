import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

const LabSubmissionsPage = () => {
  const { courseId, classId, labId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/classes/${classId}/labs/${labId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [courseId, classId, labId]);

  if (loading) {
    return <div className="p-10 text-center">Loading submissions...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Submissions</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Roll No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">XP</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((stu) => (
              <tr key={stu.studentId} className="border-t hover:bg-gray-50">
                {/* Roll */}
                <td className="px-4 py-3 text-sm">{stu.rollNumber}</td>

                {/* Name */}
                <td className="px-4 py-3 text-sm font-medium">{stu.name}</td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {stu.submitted ? (
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircle size={16} /> Submitted
                      </span>

                      {stu.isLate && (
                        <span className="inline-flex items-center gap-1 text-orange-500 text-xs font-semibold">
                          <Clock size={14} /> Late
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                      <XCircle size={16} /> Not Submitted
                    </span>
                  )}
                </td>

                {/* XP */}
                <td className="px-4 py-3 text-center font-bold">
                  {stu.submitted ? stu.xp ?? "-" : "-"}
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-center">
                  {stu.submitted ? (
                    <button
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/classes/${classId}/labs/${labId}/submissions/${stu.studentId}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Eye size={16} /> View
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No students enrolled in this class.
          </div>
        )}
      </div>
    </div>
  );
};

export default LabSubmissionsPage;
