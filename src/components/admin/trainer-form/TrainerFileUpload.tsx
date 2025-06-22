
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Image } from 'lucide-react';
import type { TrainerDocument } from '@/types/trainer';

interface TrainerFileUploadProps {
  trainerId?: string;
  existingDocuments?: TrainerDocument[];
  onDocumentsChange: (documents: TrainerDocument[]) => void;
}

const TrainerFileUpload = ({ trainerId, existingDocuments = [], onDocumentsChange }: TrainerFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<TrainerDocument[]>(existingDocuments);
  const { toast } = useToast();

  const uploadFile = async (file: File, fileType: 'profile' | 'certificate'): Promise<TrainerDocument | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${trainerId || 'temp'}_${fileType}_${Date.now()}.${fileExt}`;
      const filePath = `trainer-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('trainer-files')
        .getPublicUrl(filePath);

      const documentData = {
        id: crypto.randomUUID(),
        trainer_id: trainerId || '',
        file_name: file.name,
        file_url: data.publicUrl,
        file_type: fileType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If trainer exists, save to database immediately
      if (trainerId) {
        const { data: savedDoc, error: dbError } = await supabase
          .from('trainer_documents')
          .insert(documentData)
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        return savedDoc as TrainerDocument;
      }

      // Return temporary document for new trainers
      return documentData as TrainerDocument;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'profile' | 'certificate') => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const newDocuments: TrainerDocument[] = [];

    for (const file of Array.from(files)) {
      const document = await uploadFile(file, fileType);
      if (document) {
        newDocuments.push(document);
      }
    }

    if (newDocuments.length > 0) {
      const updatedDocuments = [...documents, ...newDocuments];
      setDocuments(updatedDocuments);
      onDocumentsChange(updatedDocuments);
      
      toast({
        title: "Success",
        description: `${newDocuments.length} file(s) uploaded successfully`,
      });
    }

    setUploading(false);
    // Reset input
    event.target.value = '';
  };

  const removeDocument = async (documentId: string) => {
    try {
      // Remove from database if trainer exists
      if (trainerId) {
        const { error } = await supabase
          .from('trainer_documents')
          .delete()
          .eq('id', documentId);

        if (error) {
          console.error('Error removing document:', error);
          throw error;
        }
      }

      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      onDocumentsChange(updatedDocuments);

      toast({
        title: "Success",
        description: "Document removed successfully",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Document Upload */}
        <div>
          <label htmlFor="profile-upload" className="block text-sm font-medium mb-2">
            Trainer Profile (CV/Resume)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <FileText className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Profile Document</span>
                <span className="text-xs text-gray-500">PDF, DOC, DOCX</span>
              </div>
            </label>
            <input
              id="profile-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'profile')}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>

        {/* Certificate Upload */}
        <div>
          <label htmlFor="certificate-upload" className="block text-sm font-medium mb-2">
            Certificates
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label htmlFor="certificate-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Certificates</span>
                <span className="text-xs text-gray-500">PDF, JPG, PNG (Multiple)</span>
              </div>
            </label>
            <input
              id="certificate-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e, 'certificate')}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  {doc.file_type === 'profile' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Image className="w-4 h-4" />
                  )}
                  <span className="text-sm">{doc.file_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {doc.file_type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Uploading files...</span>
        </div>
      )}
    </div>
  );
};

export default TrainerFileUpload;
