import React, { useRef, useState, useEffect } from "react";
import { usePostBlogMutation } from "../../../Redux/features/blogs/blogApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [conclusionContent, setConclusionContent] = useState(""); // New state for conclusion
  const quillRef = useRef(null);
  const conclusionQuillRef = useRef(null); // New ref for conclusion editor

  const categoryOptions = [
    "technology",
    "travel",
    "food",
    "lifestyle",
    "fashion",
    "health",
    "finance",
    "entertainment",
    "cars",
    "general",
  ];

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [PostBlog, { isLoading, isSuccess, isError, error, reset }] =
    usePostBlogMutation();

  // Quill editor modules configuration (same for both editors)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "font",
    "align",
    "link",
  ];

  useEffect(() => {
    if (isSuccess) {
      toast.success("Blog post created successfully!");
      resetForm();
      reset();
      setTimeout(() => {
        navigate("/dashboard/posts");
      }, 2000);
    }

    if (isError) {
      toast.error(
        `Failed to create blog post: ${
          error?.data?.message || "Something went wrong."
        }`
      );
    }
  }, [isSuccess, isError, error, navigate, reset]);

  const resetForm = () => {
    setTitle("");
    setMetaDescription("");
    setCoverImg("");
    setCategory("");
    setRating(0);
    setPreviewMode(false);
    setEditorContent("");
    setConclusionContent(""); // Reset conclusion
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setShowCategorySuggestions(true);
  };

  const selectSuggestedCategory = (suggestedCategory) => {
    setCategory(suggestedCategory);
    setShowCategorySuggestions(false);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editorContent.trim()) {
        return toast.warning("Blog content cannot be empty.");
      }

      if (!coverImg) {
        return toast.error("Please provide a cover image URL.");
      }

      const contentBlocks = {
        type: "quill",
        data: editorContent,
      };

      const conclusionBlocks = conclusionContent.trim()
        ? {
            type: "quill",
            data: conclusionContent,
          }
        : null;

      const newPost = {
        title,
        content: contentBlocks,
        conclusion: conclusionBlocks, // Include conclusion
        coverImg,
        category,
        description: metaDescription,
        author: user.username,
        rating,
      };

      await PostBlog(newPost);
    } catch (err) {
      console.error("Error saving blog content:", err);
      toast.error("Failed to save blog content.");
    }
  };

  return (
    <div className="bg-white p-4 md:p-8">
      <h2 className="text-xl font-semibold mb-4 md:text-2xl">
        Create A New Blog Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg">
            Blog Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500"
            placeholder="Ex: My Amazing Blog Post"
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="md:w-2/3 w-full">
            <p className="font-semibold text-gray-700 mb-2 text-lg">
              Content Section
            </p>
            <p className="text-sm italic text-gray-500 mb-2">
              Write your post here...
            </p>
            {previewMode ? (
              <div className="bg-gray-100 p-3 min-h-[300px] rounded-md border border-gray-300">
                <div dangerouslySetInnerHTML={{ __html: editorContent }} />
                {conclusionContent && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Conclusion
                    </h3>
                    <div dangerouslySetInnerHTML={{ __html: conclusionContent }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-md border border-gray-300">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editorContent}
                  onChange={setEditorContent}
                  modules={modules}
                  formats={formats}
                  style={{ height: "300px" }}
                  className="bg-white rounded-md"
                />
              </div>
            )}

            {/* New Conclusion Editor */}
            <p className="font-semibold text-gray-700 mb-2 mt-10 text-lg">
              Conclusion Section
            </p>
            <p className="text-sm italic text-gray-500 mb-2">
              Write your conclusion here...
            </p>
            {previewMode ? null : (
              <div className="bg-gray-100 rounded-md border border-gray-300">
                <ReactQuill
                  ref={conclusionQuillRef}
                  theme="snow"
                  value={conclusionContent}
                  onChange={setConclusionContent}
                  modules={modules}
                  formats={formats}
                  style={{ height: "200px" }} // Smaller height for conclusion
                  className="bg-white rounded-md"
                />
              </div>
            )}

            <button
              type="button"
              onClick={togglePreview}
              className="mt-10 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              {previewMode ? "Back to Editor" : "Preview"}
            </button>
          </div>

          <div className="md:w-1/3 w-full border p-4 space-y-4 rounded-md border-gray-300">
            <p className="font-semibold text-indigo-600 text-lg">
              Blog Settings
            </p>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md">
                Cover Image URL:
              </label>
              <input
                type="text"
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2 rounded-md border border-gray-300"
                placeholder="https://example.com/cover.jpg"
              />
              {coverImg && (
                <img
                  src={coverImg}
                  alt="Cover Preview"
                  className="mt-2 w-full h-32 object-cover rounded-md"
                  onError={() => toast.error("Invalid image URL")}
                />
              )}
            </div>

            <div className="relative">
              <label className="block font-semibold text-gray-700 mb-2 text-md">
                Category:
              </label>
              <input
                type="text"
                value={category}
                onChange={handleCategoryChange}
                onFocus={() => setShowCategorySuggestions(true)}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500"
                placeholder="Technology, Travel, etc."
                required
              />
              {showCategorySuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {categoryOptions
                    .filter(
                      (opt) =>
                        opt.toLowerCase().includes(category.toLowerCase()) ||
                        category === ""
                    )
                    .map((option, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 capitalize"
                        onClick={() => selectSuggestedCategory(option)}
                      >
                        {option}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md">
                Meta Description:
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500"
                rows={4}
                placeholder="SEO description for your blog post."
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md">
                Rating:
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500"
                placeholder="e.g., 5"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md">
                Author:
              </label>
              <input
                type="text"
                value={user?.username || ""}
                className="w-full bg-gray-100 px-4 py-2 rounded-md border border-gray-300"
                disabled
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {isLoading ? "Adding New Blog..." : "Add New Blog"}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default AddPost;