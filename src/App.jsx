import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// These will be filled from your Vercel environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({ name: "", urgency: "cold", notes: "" });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*");
    setLeads(data || []);
  };

  const addLead = async () => {
    if (!newLead.name) return;
    const { data } = await supabase.from("leads").insert([newLead]);
    if (data) {
      setLeads([...leads, ...data]);
      setNewLead({ name: "", urgency: "cold", notes: "" });
    }
  };

  const updateLead = async (id, field, value) => {
    const updatedLeads = leads.map(l => l.id === id ? { ...l, [field]: value } : l);
    setLeads(updatedLeads);
    await supabase.from("leads").update({ [field]: value }).eq("id", id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add New Lead</h2>
      <input
        placeholder="Lead Name"
        value={newLead.name}
        onChange={e => setNewLead({ ...newLead, name: e.target.value })}
      />
      <select
        value={newLead.urgency}
        onChange={e => setNewLead({ ...newLead, urgency: e.target.value })}
      >
        <option value="hot">Hot</option>
        <option value="warm">Warm</option>
        <option value="cold">Cold</option>
        <option value="long-term">Long-Term</option>
      </select>
      <textarea
        placeholder="Notes"
        value={newLead.notes}
        onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
      />
      <button onClick={addLead}>Add Lead</button>

      <hr />

      {leads.map(lead => (
        <div key={lead.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <strong>{lead.name}</strong> — {lead.urgency.toUpperCase()}
          <textarea
            value={lead.notes}
            onChange={e => updateLead(lead.id, "notes", e.target.value)}
          />
          <button onClick={() => console.log("Send to VA:", lead)}>Send to VA</button>
        </div>
      ))}
    </div>
  );
}
