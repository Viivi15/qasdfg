import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Bell, Check, X, Clock } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt?: string;
  errorMessage?: string;
  productId: {
    productName: string;
    expiryDate: string;
  };
}

export default function Notifications() {
  const [logs, setLogs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await api.get("/notifications");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="text-yellow-500" /> Notification Logs
      </h1>

      {loading ? (
        <div className="text-center py-10">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
          No notifications sent yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    log.type === "TEST" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {log.type.replace("_", " ")}
                  </span>
                  <span className="text-sm font-medium">{log.productId?.productName || "Unknown Product"}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Scheduled: {new Date(log.scheduledFor).toLocaleString()}
                </p>
                {log.sentAt && (
                   <p className="text-xs text-gray-500">
                     Sent: {new Date(log.sentAt).toLocaleString()}
                   </p>
                )}
                {log.errorMessage && (
                  <p className="text-xs text-red-500 mt-1">Error: {log.errorMessage}</p>
                )}
              </div>

              <div>
                {log.status === "SENT" && <Check className="text-green-500" />}
                {log.status === "FAILED" && <X className="text-red-500" />}
                {log.status === "PENDING" && <Clock className="text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
