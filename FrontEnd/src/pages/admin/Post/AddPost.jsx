import React, { useRef, useState, useEffect } from "react";
import { usePostBlogMutation } from "../../../Redux/features/blogs/blogApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Suppress specific console warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0].includes("Warning: findDOMNode is deprecated") ||
    args[0].includes("DOMNodeInserted mutation event") ||
    args[0].includes("Received `true` for a non-boolean attribute `jsx`") ||
    args[0].includes("InvalidCharacterError")
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Apply suppression early to catch Quill initialization warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0].includes("DOMNodeInserted mutation event")) {
    return;
  }
  originalConsoleWarn(...args);
};

// Register custom fonts with Quill
const Font = ReactQuill.Quill.import("formats/font");
Font.whitelist = [
  "Montserrat",
  "Roboto",
  "OpenSans",
  "Lato",
  "FiraSans",
  "Merriweather",
  "PlayfairDisplay",
  "Nunito",
  "Raleway",
  "Rubik",
  "Baumans",
  "Lora", // Replaced LuxuriousRoman with Lora
];
ReactQuill.Quill.register(Font, true);

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [conclusionContent, setConclusionContent] = useState("");
  const quillRef = useRef(null);
  const conclusionQuillRef = useRef(null);

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

  // Quill editor modules configuration with normalized font names
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [
        {
          font: [
            "",
            "Montserrat",
            "Roboto",
            "OpenSans",
            "Lato",
            "FiraSans",
            "Merriweather",
            "PlayfairDisplay",
            "Nunito",
            "Raleway",
            "Rubik",
            "Baumans",
            "Lora", // Replaced LuxuriousRoman with Lora
          ],
        },
      ],
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
    setEditorContent("");
    setConclusionContent("");
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setShowCategorySuggestions(true);
  };

  const selectSuggestedCategory = (suggestedCategory) => {
    setCategory(suggestedCategory);
    setShowCategorySuggestions(false);
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
        conclusion: conclusionBlocks,
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
    <div className="bg-white p-4 md:p-8 font-[Montserrat]">
      <h2 className="text-xl font-semibold mb-4 md:text-2xl font-[Playfair_Display] text-indigo-800">
        Create A New Blog Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg font-[Raleway]">
            Blog Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500 font-[Open_Sans]"
            placeholder="Ex: My Amazing Blog Post"
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="md:w-2/3 w-full">
            <div className="mb-10">
              <p className="font-semibold text-gray-700 mb-2 text-lg font-[Merriweather]">
                Content Section
              </p>
              <p className="text-sm italic text-gray-500 mb-2 font-[Lato]">
                Write your post here...
              </p>
              <div className="bg-gray-100 rounded-md border border-gray-300">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editorContent}
                  onChange={(content) => {
                    console.log("Content editor HTML:", content); // Debug: Log editor output
                    setEditorContent(content);
                  }}
                  modules={modules}
                  formats={formats}
                  style={{ height: "300px", fontFamily: "'Nunito', sans-serif" }}
                  className="bg-white rounded-md"
                />
              </div>
            </div>

            {/* Conclusion Editor */}
            <div className="mb-8">
              <p className="font-semibold text-gray-700 mb-2 text-lg font-[Merriweather]">
                Conclusion Section
              </p>
              <p className="text-sm italic text-gray-500 mb-2 font-[Lato]">
                Write your conclusion here...
              </p>
              <div className="bg-gray-100 rounded-md border border-gray-300">
                <ReactQuill
                  ref={conclusionQuillRef}
                  theme="snow"
                  value={conclusionContent}
                  onChange={(content) => {
                    console.log("Conclusion editor HTML:", content); // Debug: Log editor output
                    setConclusionContent(content);
                  }}
                  modules={modules}
                  formats={formats}
                  style={{ height: "200px", fontFamily: "'Nunito', sans-serif" }}
                  className="bg-white rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="md:w-1/3 w-full border p-4 space-y-4 rounded-md border-gray-300 bg-gray-50">
            <p className="font-semibold text-indigo-600 text-lg font-[Baumans]">
              Blog Settings
            </p>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md font-[Raleway]">
                Cover Image URL:
              </label>
              <input
                type="text"
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2 rounded-md border border-gray-300 font-[Open_Sans]"
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
              <label className="block font-semibold text-gray-700 mb-2 text-md font-[Raleway]">
                Category:
              </label>
              <input
                type="text"
                value={category}
                onChange={handleCategoryChange}
                onFocus={() => setShowCategorySuggestions(true)}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500 font-[Open_Sans]"
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
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 capitalize font-[Open_Sans]"
                        onClick={() => selectSuggestedCategory(option)}
                      >
                        {option}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md font-[Raleway]">
                Meta Description:
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500 font-[Open_Sans]"
                rows={4}
                placeholder="SEO description for your blog post."
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md font-[Raleway]">
                Rating:
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-gray-100 px-4 py-2 focus:outline-none rounded-md border border-gray-300 focus:border-indigo-500 font-[Open_Sans]"
                placeholder="e.g., 5"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-md font-[Raleway]">
                Author:
              </label>
              <input
                type="text"
                value={user?.username || ""}
                className="w-full bg-gray-100 px-4 py-2 rounded-md border border-gray-300 font-[Open_Sans]"
                disabled
              />
            </div>
          </div>
        </div>

        <br />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 font-[Rubik] tracking-wide transition-colors duration-300 mt-8"
        >
          {isLoading ? "Adding New Blog..." : "Add New Blog"}
        </button>
      </form>

      {/* Global styles for Quill editor */}
      <style>{`
        /* Custom styles for the editor */
        .ql-editor {
          font-family: 'Nunito', sans-serif;
        }
        .ql-editor h1 {
          font-family: 'Playfair Display', serif;
        }
        .ql-editor h2, .ql-editor h3 {
          font-family: 'Merriweather', serif;
        }
        .ql-editor p {
          font-family: 'Nunito', sans-serif;
        }
        /* Font family classes for Quill font dropdown */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Montserrat"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Montserrat"]::before {
          font-family: 'Montserrat', sans-serif;
          content: 'Montserrat';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Roboto"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Roboto"]::before {
          font-family: 'Roboto', sans-serif;
          content: 'Roboto';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="OpenSans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="OpenSans"]::before {
          font-family: 'Open Sans', sans-serif;
          content: 'Open Sans';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Lato"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Lato"]::before {
          font-family: 'Lato', sans-serif;
          content: 'Lato';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="FiraSans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="FiraSans"]::before {
          font-family: 'Fira Sans', sans-serif;
          content: 'Fira Sans';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Merriweather"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Merriweather"]::before {
          font-family: 'Merriweather', serif;
          content: 'Merriweather';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="PlayfairDisplay"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="PlayfairDisplay"]::before {
          font-family: 'Playfair Display', serif;
          content: 'Playfair Display';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Nunito"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Nunito"]::before {
          font-family: 'Nunito', sans-serif;
          content: 'Nunito';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Raleway"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Raleway"]::before {
          font-family: 'Raleway', sans-serif;
          content: 'Raleway';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Rubik"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Rubik"]::before {
          font-family: 'Rubik', sans-serif;
          content: 'Rubik';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Baumans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Baumans"]::before {
          font-family: 'Baumans', cursive;
          content: 'Baumans';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Lora"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Lora"]::before {
          font-family: 'Lora', serif;
          content: 'Lora';
        }
        /* Font classes for Quill editor content */
        .ql-font-Montserrat {
          font-family: 'Montserrat', sans-serif !important;
        }
        .ql-font-Roboto {
          font-family: 'Roboto', sans-serif !important;
        }
        .ql-font-OpenSans {
          font-family: 'Open Sans', sans-serif !important;
        }
        .ql-font-Lato {
          font-family: 'Lato', sans-serif !important;
        }
        .ql-font-FiraSans {
          font-family: 'Fira Sans', sans-serif !important;
        }
        .ql-font-Merriweather {
          font-family: 'Merriweather', serif !important;
        }
        .ql-font-PlayfairDisplay {
          font-family: 'Playfair Display', serif !important;
        }
        .ql-font-Nunito {
          font-family: 'Nunito', sans-serif !important;
        }
        .ql-font-Raleway {
          font-family: 'Raleway', sans-serif !important;
        }
        .ql-font-Rubik {
          font-family: 'Rubik', sans-serif !important;
        }
        .ql-font-Baumans {
          font-family: 'Baumans', cursive !important;
        }
        .ql-font-Lora {
          font-family: 'Lora', serif !important;
        }
      `}</style>

      <ToastContainer />
    </div>
  );
};

export default AddPost;