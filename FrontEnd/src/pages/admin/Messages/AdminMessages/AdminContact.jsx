import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const apiUrl = `${API_URL}/api/contacts`;
        console.log(`Fetching contacts from: ${apiUrl}`);

        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded with ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('Fetched data:', data);

        // Backend returns: { contacts: [...], pagination: {...} }
        const contactsArray = Array.isArray(data.contacts) ? data.contacts : [];
        setContacts(contactsArray);

      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err.message);
        toast.error(`Failed to load contacts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
          Contact Submissions
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          View the latest contact submissions to{' '}
          <span className="text-[#883FFF]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            NRNHUB
          </span>.
        </p>

        {loading && (
          <div className="text-center text-gray-600">Loading contacts...</div>
        )}

        {error && (
          <div className="text-center text-red-500">
            Error: {error}
          </div>
        )}

        {!loading && !error && contacts.length === 0 && (
          <div className="text-center text-gray-600">
            No contact submissions found.
          </div>
        )}

        {!loading && !error && contacts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-800">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{contact.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {contact.phone || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {contact.message || 'No message'}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminContact;