import React, { useRef, useState, useEffect } from "react";
import { usePostBlogMutation } from "../../../Redux/features/blogs/blogApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [PostBlog, { isLoading, isSuccess, isError, error, reset }] =
    usePostBlogMutation();

  useEffect(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      autofocus: true,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true
        }
      },
      onReady: () => {
        editorRef.current = editor;
      }
    });

    return () => {
      editor?.destroy?.();
      editorRef.current = null;
    };
  }, []);

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
    if (editorRef.current) editorRef.current.clear();
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
        content, // Ensure this is the raw object, not stringified here
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
    <div className="bg-white md:p-8 p-2">
      <h2 className="text-2xl font-semibold">Create A New Blog Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="font-semibold text-xl">Blog Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-100 px-5 py-3 focus:outline-none"
            placeholder="Ex: My Amazing Blog Post"
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="md:w-2/3 w-full">
            <p className="font-semibold text-xl mb-2">Content Section</p>
            <p className="text-xs italic">Write your post here...</p>
            <div id="editorjs" className="bg-gray-100 p-2 min-h-[300px]" />
          </div>

          <div className="md:w-1/3 w-full border p-5 space-y-5">
            <p className="font-semibold text-xl text-indigo-600">Blog Settings</p>

            <div>
              <label className="font-semibold">Cover Image:</label>
              <input
                type="text"
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                className="w-full bg-gray-100 px-5 py-3 focus:outline-none"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-100 px-5 py-3 focus:outline-none"
                placeholder="Technology, Travel, etc."
                required
              />
            </div>

            <div>
              <label className="font-semibold">Meta Description:</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-gray-100 px-5 py-3 focus:outline-none"
                rows={4}
                placeholder="SEO description for your blog post."
                required
              />
            </div>

            <div>
              <label className="font-semibold">Rating:</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-gray-100 px-5 py-3 focus:outline-none"
                placeholder="e.g., 5"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Author:</label>
              <input
                type="text"
                value={user.username}
                className="w-full bg-gray-100 px-5 py-3"
                disabled
              />
            </div>
          </div>
        </div>

        <br />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md font-medium"
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