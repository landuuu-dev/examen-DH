import React from "react";

function ImageUploader({ handleFileChange }) {
  return (
    <input
      type="file"
      multiple
      accept="image/*"
      className="border p-2 rounded w-full mt-4"
      onChange={handleFileChange}
    />
  );
}

export default ImageUploader;
