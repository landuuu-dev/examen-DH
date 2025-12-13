import React from "react";

function ImageUploader({ name, handleFileChange }) {
  return (
    <input
      type="file"
      name={name}
      accept="image/*"
      className="border p-2 rounded w-full mt-2"
      onChange={handleFileChange}
    />
  );
}

export default ImageUploader;
