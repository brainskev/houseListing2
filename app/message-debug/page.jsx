"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MessageDebugPage() {
  const [logs, setLogs] = useState([]);
  const [testData, setTestData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (source, message, data = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
    
    setLogs(prev => [...prev, { 
      timestamp, 
      source, 
      message, 
      data,
      id: Math.random()
    }]);
  };

  const runTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    try {
      addLog("TEST", "🚀 Starting test sequence");

      // Step 1: Get current unread count
      addLog("STEP 1", "Fetching initial unread count");
      const countRes = await axios.get("/api/messages/unread-count");
      addLog("STEP 1", "Initial unread count:", { count: countRes.data?.count });

      // Step 2: Get inbox messages
      addLog("STEP 2", "Fetching inbox messages");
      const inboxRes = await axios.get("/api/messages");
      const messages = inboxRes.data?.properties || [];
      addLog("STEP 2", `Got ${messages.length} messages`);
      
      // Log each message with detailed info
      messages.forEach((msg, idx) => {
        addLog("STEP 2", `Message ${idx}:`, {
          id: msg._id,
          sender: msg.sender?._id || msg.sender,
          property: msg.property?._id || msg.property,
          read: msg.read,
          createdAt: msg.createdAt
        });
      });

      if (messages.length === 0) {
        addLog("TEST", "❌ No messages to test with");
        setIsRunning(false);
        return;
      }

      // Step 3: Mark first unread thread as read
      const firstUnread = messages.find(m => !m.read);
      if (!firstUnread) {
        addLog("TEST", "❌ No unread messages found");
        setIsRunning(false);
        return;
      }

      const propertyId = firstUnread.property?._id || firstUnread.property;
      const senderId = firstUnread.sender?._id || firstUnread.sender;

      addLog("STEP 3", "Marking thread as read", { propertyId, senderId });

      const markRes = await axios.patch("/api/messages", { 
        propertyId, 
        senderId 
      });

      addLog("STEP 3", "Mark response:", {
        updated: markRes.data?.updated,
        message: markRes.data?.message
      });

      // Step 4: Check unread count after marking
      await new Promise(r => setTimeout(r, 500));
      addLog("STEP 4", "Fetching unread count after marking (500ms wait)");
      const count2Res = await axios.get("/api/messages/unread-count");
      addLog("STEP 4", "Unread count after marking:", { count: count2Res.data?.count });

      // Step 5: Refresh inbox to verify read status persisted
      addLog("STEP 5", "Re-fetching inbox to verify read status");
      const inbox2Res = await axios.get("/api/messages");
      const updatedMessages = inbox2Res.data?.properties || [];
      
      const updatedThread = updatedMessages.find(m => {
        const pId = m.property?._id || m.property;
        const sId = m.sender?._id || m.sender;
        return pId === propertyId && sId === senderId;
      });

      if (updatedThread) {
        addLog("STEP 5", "Updated thread in inbox:", {
          id: updatedThread._id,
          read: updatedThread.read,
          beforeWasRead: firstUnread.read
        });
      }

      // Step 6: Open same thread again
      addLog("STEP 6", "Opening same thread again (simulating UI open)");
      const markAgainRes = await axios.patch("/api/messages", {
        propertyId,
        senderId
      });

      addLog("STEP 6", "Mark again response:", {
        updated: markAgainRes.data?.updated,
        message: markAgainRes.data?.message
      });

      // Step 7: Check count again
      await new Promise(r => setTimeout(r, 500));
      addLog("STEP 7", "Fetching unread count after second mark (500ms wait)");
      const count3Res = await axios.get("/api/messages/unread-count");
      addLog("STEP 7", "Unread count after second mark:", { count: count3Res.data?.count });

      // Step 8: Re-fetch inbox again
      addLog("STEP 8", "Re-fetching inbox to verify read status still persisted");
      const inbox3Res = await axios.get("/api/messages");
      const finalMessages = inbox3Res.data?.properties || [];
      
      const finalThread = finalMessages.find(m => {
        const pId = m.property?._id || m.property;
        const sId = m.sender?._id || m.sender;
        return pId === propertyId && sId === senderId;
      });

      if (finalThread) {
        addLog("STEP 8", "Final thread state:", {
          id: finalThread._id,
          read: finalThread.read
        });
      }

      addLog("TEST", "✅ Test sequence completed");
      setTestData({
        initialCount: countRes.data?.count,
        afterMarkCount: count2Res.data?.count,
        afterSecondMarkCount: count3Res.data?.count,
        threadId: propertyId,
        senderId
      });

    } catch (error) {
      addLog("ERROR", error.message || "Unknown error", {
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Message System Debug</h1>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runTest}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold"
          >
            {isRunning ? "Running..." : "Run Test Sequence"}
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold"
          >
            Clear Logs
          </button>
        </div>

        {testData && (
          <div className="mb-6 bg-green-900 p-4 rounded">
            <h2 className="font-bold mb-2">Test Results Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Initial unread count: <strong>{testData.initialCount}</strong></div>
              <div>After 1st mark: <strong>{testData.afterMarkCount}</strong></div>
              <div>After 2nd mark: <strong>{testData.afterSecondMarkCount}</strong></div>
              <div>Expected after 2nd: <strong>{testData.afterMarkCount}</strong> (should stay same)</div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded p-4 font-mono text-xs overflow-auto max-h-96">
          {logs.length === 0 ? (
            <div className="text-gray-500">Logs will appear here...</div>
          ) : (
            <div className="space-y-1">
              {logs.map(log => (
                <div key={log.id} className="text-gray-300">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  {" "}
                  <span className="font-bold text-blue-400">{log.source}</span>
                  {" "}
                  <span className="text-gray-200">{log.message}</span>
                  {Object.keys(log.data).length > 0 && (
                    <>
                      {" "}
                      <span className="text-green-400">{JSON.stringify(log.data)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <h3 className="font-bold mb-2">What this test does:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Gets initial unread count</li>
            <li>Fetches all inbox messages</li>
            <li>Marks first unread thread as read</li>
            <li>Checks unread count (should decrease)</li>
            <li>Re-fetches inbox to verify read status persisted</li>
            <li>Opens same thread again (marks again)</li>
            <li>Checks unread count (should stay same, not reappear)</li>
            <li>Re-fetches inbox to verify status still correct</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
