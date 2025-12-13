"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AuthDebugPage() {
  const [logs, setLogs] = useState([]);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("password123");

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const testSignup = async () => {
    try {
      addLog("Testing signup...", "info");
      const response = await axios.post("/api/auth/signup", {
        name: "Test User",
        email: testEmail,
        password: testPassword,
      });
      addLog(`Signup successful: ${JSON.stringify(response.data)}`, "success");
    } catch (error) {
      addLog(`Signup error: ${error.response?.data?.message || error.message}`, "error");
    }
  };

  const testPasswordReset = async () => {
    try {
      addLog("Testing forgot password...", "info");
      const response = await axios.post("/api/auth/forgot-password", {
        email: testEmail,
      });
      addLog(`Reset request sent: ${response.data.message}`, "success");
      addLog("Check server console for reset link!", "info");
    } catch (error) {
      addLog(`Reset error: ${error.response?.data?.message || error.message}`, "error");
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Debug Tool
          </h1>
          <p className="text-gray-600 mb-4">
            Use this page to test authentication flows and see detailed logs.
            Check browser console and server terminal for additional details.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Password
              </label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={testSignup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Test Signup
              </button>
              <button
                onClick={testPasswordReset}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test Password Reset
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs yet. Run a test above.</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded text-sm font-mono ${
                    log.type === "error"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : log.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-gray-50 text-gray-800 border border-gray-200"
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Check the server terminal for detailed logs during signup/login</li>
            <li>Password reset links appear in the server console (not browser)</li>
            <li>Open browser DevTools console for client-side logs</li>
            <li>Delete this page in production!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
