import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import NoticeForm from "../../components/NoticeForm.jsx";

// PAGES ROUTER - NEW BULLETIN DISPATCH
export default function NewNoticePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("TRANSMISSION FAULT ON SERVER DISPATCH");
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <NoticeForm
          onSubmit={handleCreate}
          isLoading={isLoading}
          onCancel={() => {
            window.location.href = "/";
          }}
        />
      </div>
    </Layout>
  );
}
