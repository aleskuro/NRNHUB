import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFetchBlogByIdQuery, useUpdateBlogMutation } from "../../../Redux/features/blogs/blogAPI";

const UpdatePost = () => {
    const { id } = useParams();
    const editorRef = useRef(null);
    const [title, setTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [coverImg, setCoverImg] = useState("");
    const [category, setCategory] = useState("");
    const [rating, setRating] = useState(0);
    const [editorContent, setEditorContent] = useState(null);

    const { data: blog, error: fetchError, isLoading: isFetching } = useFetchBlogByIdQuery(id);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [updateBlog, { isLoading: isUpdating, isSuccess, isError, error: updateError, reset: resetUpdate }] = useUpdateBlogMutation();

    // Initialize Editor.js
    useEffect(() => {
        if (blog && !isFetching) {
            setTitle(blog.title);
            setMetaDescription(blog.description);
            setCoverImg(blog.coverImg);
            setCategory(blog.category);
            setRating(blog.rating);
            setEditorContent(blog.content);

            if (!editorRef.current) {
                editorRef.current = new EditorJS({
                    holder: 'editorjs',
                    data: blog.content,
                    tools: {
                        header: Header,
                        list: List,
                    },
                    onReady: () => {
                        // Editor is ready
                    },
                    onChange: async () => {
                        // Data changed
                    },
                });
            }
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [blog, isFetching]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUpdating) return;

        try {
            const content = await editorRef.current.save();

            if (!content.blocks || content.blocks.length === 0) {
                toast.warning("Blog content cannot be empty.");
                return;
            }

            const updatedPost = {
                title,
                content,
                coverImg,
                category,
                description: metaDescription,
                rating,
            };

            const response = await updateBlog({ id, ...updatedPost }).unwrap();
            toast.success(response.message || 'Blog post updated successfully!');
            resetUpdate();
            navigate("/dashboard"); // Redirect to /dashboard

        } catch (err) {
            console.error("Error updating blog post:", err);
            toast.error(err?.data?.message || 'Failed to update blog post. Please try again.');
        }
    };

    // Handle fetch errors and redirect
    useEffect(() => {
        if (fetchError) {
            toast.error(`Error loading blog: ${fetchError?.data?.message || 'Failed to load blog'}`);
            navigate('/dashboard');
        }
    }, [fetchError, navigate]);

    // Handle update errors and success
    useEffect(() => {
        if (isSuccess) {
            toast.success("Blog post updated successfully!");
            navigate("/dashboard");
        }

        if (isError) {
            toast.error(updateError?.data?.message || "Failed to update blog post. Please try again.");
        }
    }, [isSuccess, isError, updateError, navigate]);

    if (isFetching) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (!blog) {
        return <div className="text-center py-4">Blog not found.</div>;
    }

    return (
        <div className="bg-white md:p-8 p-2">
            <h2 className="text-2xl font-semibold">Update the Post</h2>

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
                        <p className="text-xs italic">Make changes to your post here...</p>
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
                    disabled={isUpdating}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md font-medium"
                >
                    {isUpdating ? 'Updating Blog...' : 'Update Blog Post'}
                </button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default UpdatePost;
