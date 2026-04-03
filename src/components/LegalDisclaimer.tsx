import { FileText, Download, Shield } from 'lucide-react';

export default function LegalDisclaimer() {
  const downloadDeclarationForm = () => {
    const formContent = `V3BMusic.AI – RIGHTS & OWNERSHIP DECLARATION FORM

Creator Full Name: _________________________________________
Stage/Artist Name (if any): _________________________________
Email: _____________________________________________________
Company/Label Name (if applicable): ________________________

I hereby declare that:

1. I am the sole legal owner (or authorised representative of the owner) of all audio content I upload to the V3BMusic.AI platform.

2. The works submitted are officially registered with the appropriate rights organisations and distributors.

3. I hold full rights for:
   • Commercial licensing
   • Streaming
   • Sale
   • Download
   • Public use
   • Royalty collection

4. The audio I upload contains no copyrighted samples or third-party materials without proper clearance.

5. I grant V3BMusic.AI permission to:
   • Display, promote, and sell my work
   • Process royalties using its AI–blockchain system
   • Distribute revenue owed to me according to the platform's payment structure

6. I understand that misrepresentation of ownership is illegal, and I accept full liability for any copyright disputes arising from my uploads.

Signature: ______________________________________________
Date: ______________________________________________

---

For more information, visit: https://dccsverify.com
`;

    const blob = new Blob([formContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'V3BMusic-Rights-Ownership-Declaration.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg border border-white/10 rounded-lg p-6 space-y-4">
      <div className="flex items-start space-x-3">
        <Shield className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-3">Content Ownership Declaration</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p className="font-medium">By uploading any audio file to V3BMusic.AI, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You are the legal owner of the audio assets you upload</li>
              <li>The work is registered under your name with your respective distributor, PRO, or rights body</li>
              <li>You hold full commercial rights, including licensing, sale, and distribution rights</li>
              <li>Your upload contains no samples, loops, or copyrighted material owned by third parties (unless you have documented clearance)</li>
              <li>V3BMusic.AI is not responsible for copyright disputes arising from misrepresentation of ownership</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-200 text-sm font-medium">
              Any uploads that violate copyright or ownership laws will be removed immediately.
              Repeated violations may result in permanent account suspension.
            </p>
          </div>

          <button
            onClick={downloadDeclarationForm}
            className="mt-4 w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Rights Declaration Form</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegalFooter() {
  return (
    <div className="border-t border-white/10 pt-4 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <FileText className="h-3 w-3" />
          <span>All uploads subject to copyright verification</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-3 w-3" />
          <span>Protected by V3B Rights Management System</span>
        </div>
      </div>
    </div>
  );
}
