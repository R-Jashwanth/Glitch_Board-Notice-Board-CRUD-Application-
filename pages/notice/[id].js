import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout.jsx";
import NoticeForm from "../../components/NoticeForm.jsx";

// PAGES ROUTER - EDIT / RETRIEVE DYNAMIC BULLETIN NODE
export default function EditNoticePage({ id }) {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dynamic Router Hook simulation / window compatibility fallback
  const nodeId = id || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "");

  useEffect(() => {
    if (!nodeId || nodeId === "[id]") return;

    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${nodeId}`);
        if (!res.ok) throw new Error("NODE_NOT_REGISTERED");
        const data = await res.json();
        setNotice(data);
      } catch (err) {
        console.error("Failed to query notice node:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [nodeId]);

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/notices/${nodeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("REWRITE_TRANSMISSION_REJECTED");

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(`ERROR REWRITING NODE: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center text-xs uppercase tracking-widest text-[#00f0ff] font-mono animate-pulse">
          Querying dynamic routing sector [{nodeId}]...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {notice ? (
          <NoticeForm
            initialData={notice}
            onSubmit={handleUpdate}
            isLoading={actionLoading}
            onCancel={() => {
              window.location.href = "/";
            }}
          />
        ) : (
          <div className="text-center p-12 border-2 border-[#ff00ff] bg-black/60 text-[#ff00ff] neon-border-magenta">
            NODE [{nodeId}] IS DE-COMMISSIONED OR NOT ACTIVE
          </div>
        )}
      </div>
    </Layout>
  );
}

// NextJS SSR context helper
export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: { id },
  };
}
