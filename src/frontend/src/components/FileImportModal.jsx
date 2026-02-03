import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';

/**
 * Composant réutilisable pour l'importation de fichiers CSV/Excel
 * @param {Object} props
 * @param {Function} props.onImport - Callback appelé avec les données importées
 * @param {Array} props.requiredFields - Champs obligatoires attendus dans le fichier
 * @param {String} props.entityName - Nom de l'entité (pour les messages)
 * @param {Function} props.onClose - Callback pour fermer le modal
 */
export default function FileImportModal({ onImport, requiredFields = [], entityName = 'entités', onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Vérifier l'extension
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Format de fichier invalide. Veuillez utiliser CSV ou Excel (.xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseFile(selectedFile);
  };

  const parseFile = async (file) => {
    setLoading(true);
    setValidationErrors([]);

    try {
      const text = await file.text();
      
      // Parse CSV simple
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        setError('Le fichier est vide');
        setLoading(false);
        return;
      }

      // Extraire les headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Vérifier les champs requis
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        setError(`Champs manquants dans le fichier: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Parser les données
      const data = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Ligne ${i + 1}: Nombre de colonnes incorrect`);
          continue;
        }

        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        data.push(row);
      }

      setPreview(data.slice(0, 5)); // Afficher les 5 premières lignes
      setValidationErrors(errors);

      if (errors.length > 0) {
        setError(`${errors.length} erreur(s) détectée(s) dans le fichier`);
      }
    } catch (err) {
      console.error('Erreur parsing:', err);
      setError('Erreur lors de la lecture du fichier');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      await onImport(data);
      alert(`✅ ${data.length} ${entityName} importé(es) avec succès !`);
      onClose();
    } catch (err) {
      console.error('Erreur import:', err);
      setError('Erreur lors de l\'importation');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Créer un fichier CSV template
    const headers = requiredFields.join(',');
    const exampleRow = requiredFields.map(() => 'exemple').join(',');
    const csvContent = `${headers}\n${exampleRow}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${entityName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Importer des {entityName}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Importez plusieurs {entityName} à partir d'un fichier CSV ou Excel
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Template Download */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Fichier modèle</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Téléchargez le fichier modèle pour voir le format requis
                  </p>
                  <p className="text-xs text-blue-600">
                    Champs requis: {requiredFields.join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition cursor-pointer"
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {file ? file.name : 'Cliquez pour sélectionner un fichier'}
              </p>
              <p className="text-sm text-gray-500">
                Formats acceptés: CSV, Excel (.xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                {validationErrors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>... et {validationErrors.length - 5} autre(s) erreur(s)</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aperçu ({preview.length} premières lignes)
              </h3>
              <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(preview[0]).map((key, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading || validationErrors.length > 0}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Importation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Importer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}