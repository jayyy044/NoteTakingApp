const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Save document to database
async function saveDocument(docName, data) {
  try {
    // Convert Uint8Array to base64 for storage
    const base64Data = Buffer.from(data).toString('base64');
    
    const { error } = await supabase
      .from('documents')
      .upsert({
        name: docName,
        data: base64Data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name'
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving document:', err);
    throw err;
  }
}

// Load document from database
async function loadDocument(docName) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('data')
      .eq('name', docName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Document not found - this is ok for new documents
        return null;
      }
      throw error;
    }

    if (!data || !data.data) return null;

    // Convert base64 back to Uint8Array
    return new Uint8Array(Buffer.from(data.data, 'base64'));
  } catch (err) {
    console.error('Error loading document:', err);
    throw err;
  }
}

// List all documents
async function listDocuments() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('name, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error listing documents:', err);
    throw err;
  }
}

// Delete document
async function deleteDocument(docName) {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('name', docName);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting document:', err);
    throw err;
  }
}

module.exports = {
  supabase,
  saveDocument,
  loadDocument,
  listDocuments,
  deleteDocument
};