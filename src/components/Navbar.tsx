"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  uploadQuestionsBulk,
  BulkQuestionUploadResponse,
} from "@/lib/api";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkQuestionUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
  };

  const handleZipFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedZipFile(file);
    setUploadResult(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    try {
      setIsUploading(true);
      setUploadResult(null);
      setUploadError(null);
      console.log("Uploading JSON file to /api/v1/questions/bulk:", selectedFile);
      if (selectedZipFile) {
        console.log("Also uploading ZIP file:", selectedZipFile);
      }
      const result = await uploadQuestionsBulk(selectedFile, selectedZipFile);
      setUploadResult(result);
      console.log("Upload complete");
      setSelectedFile(null);
      setSelectedZipFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (zipFileInputRef.current) {
        zipFileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading questions JSON:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload questions JSON"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ABC Institute
              </h1>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload JSON
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 transform transition-all duration-200 scale-100 max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload JSON File
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select a JSON file from your computer to import exam questions in bulk.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setSelectedZipFile(null);
                  setUploadResult(null);
                  setUploadError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  if (zipFileInputRef.current) {
                    zipFileInputRef.current.value = "";
                  }
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                  {/* Simple upload icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 3v12m0-12 4 4m-4-4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 15v3.4A2.6 2.6 0 0 0 7.6 21h8.8A2.6 2.6 0 0 0 19 18.4V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop your JSON file here
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  or click to browse from your device
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-50">
                  <span>Choose file</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className="mt-3 text-xs text-gray-600">
                    Selected file:{" "}
                    <span className="font-medium text-gray-800">
                      {selectedFile.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-3">
                  {/* Zip file icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 3v12m0-12 4 4m-4-4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 15v3.4A2.6 2.6 0 0 0 7.6 21h8.8A2.6 2.6 0 0 0 19 18.4V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Upload ZIP folder (Optional)
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  or click to browse from your device
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-inset ring-green-200 hover:bg-green-50">
                  <span>Choose ZIP file</span>
                  <input
                    ref={zipFileInputRef}
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={handleZipFileChange}
                    className="hidden"
                  />
                </label>
                {selectedZipFile && (
                  <p className="mt-3 text-xs text-gray-600">
                    Selected file:{" "}
                    <span className="font-medium text-gray-800">
                      {selectedZipFile.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  JSON file is required. ZIP file is optional.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedFile(null);
                      setSelectedZipFile(null);
                      setUploadResult(null);
                      setUploadError(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      if (zipFileInputRef.current) {
                        zipFileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isUploading}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors"
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                      </span>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="rounded-md bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              )}

              {uploadResult && (
                <div className="space-y-3">
                  <div
                    className={`rounded-md border px-4 py-3 text-sm ${
                      uploadResult.data.failed > 0
                        ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                        : "bg-green-50 border-green-200 text-green-900"
                    }`}
                  >
                    <p className="font-medium">{uploadResult.message}</p>
                    <p className="mt-1 text-xs opacity-90">
                      Total: {uploadResult.data.total} | Created: {uploadResult.data.created} | Failed: {uploadResult.data.failed}
                    </p>
                  </div>

                  {uploadResult.data.faulty &&
                    uploadResult.data.faulty.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">
                            Failed questions ({uploadResult.data.faulty.length})
                          </h3>
                          <p className="text-xs text-gray-400">
                            Scroll to review all issues
                          </p>
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-gray-50">
                          <ul className="divide-y divide-gray-200 text-sm">
                            {uploadResult.data.faulty.map((item, index) => (
                              <li
                                key={`${item.question_id}-${index}`}
                                className="px-4 py-2 flex items-start gap-3"
                              >
                                <span className="mt-1 h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.question_id}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {item.reason}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

