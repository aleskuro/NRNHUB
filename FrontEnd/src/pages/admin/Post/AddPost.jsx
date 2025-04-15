import React, { useEffect, useRef, useState } from "react";
import { usePostBlogMutation } from "../../../Redux/features/blogs/blogAPI";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddPost = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [PostBlog, { isLoading, isSuccess, isError, error, reset }] = usePostBlogMutation();

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
      navigate("/dashboard/add-new-post");
    }

    if (isError) {
      toast.error(`Failed to create blog post, Please Login back Again...: ${error?.data?.message || 'Something went wrong.'}`);
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
      const content = await editorRef.current.save();
      console.log('Saved EditorJS Content:', JSON.stringify(content, null, 2));
  
      if (!content.blocks || content.blocks.length === 0) {
        return toast.warning("Blog content cannot be empty.");
      }
  
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
      console.error("Error saving editor content:", err);
      toast.error("Failed to save blog content.");
    }
  };

  return (
    <div className="bg-white md:p-8 p-2">
      <h2 className="text-2xl font-semibold">Create A New Blog Post</h2>

      <form onSubmit={handleSubmit} className="space-y-5 pt-8">
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

        <div className="flex flex-col md:flex-row gap-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md font-medium"
        >
          {isLoading ? 'Adding New Blog...' : 'Add New Blog'}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default AddPost;
