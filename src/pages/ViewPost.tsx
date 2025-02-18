import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '@/stores/userStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

interface Post {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  parentId?: string | null;  // 부모 댓글 ID 추가
}

interface CommentResponse {
  success: boolean;
  comments: Comment[];
}

function ViewPost() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useUserStore();
  const [inputValue, setInputValue] = useState<string>('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isReplyInputVisible, setIsReplyInputVisible] = useState<{ [key: string]: boolean }>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');

  useEffect(() => {
    if (!postId) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    // Fetch the post data
    axios
      .get(`http://localhost:5000/boards/1/posts/${postId}?currentPage=1&limit=4`)
      .then(response => {
        if (response.data && response.data.post) {
          setPost(response.data.post);
          setEditedTitle(response.data.post.title);
          setEditedContent(response.data.post.content);
        } else {
          throw new Error("Post not found");
        }
      })
      .catch(err => {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load the post");
      });

    // Fetch the comments data
    axios
      .get<CommentResponse>(`http://localhost:5000/comments/${postId}`)
      .then(response => {
        if (response.data.success && response.data.comments) {
          setComments(response.data.comments); // Update comments state
        } else {
          throw new Error("No comments found for this post");
        }
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
        setError(err.message || "Failed to load comments");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postId]);

  const handleDeletePost = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const authToken = localStorage.getItem("authToken");
    
      if (!authToken) {
        throw new Error("User is not authenticated.");
      }
    
      const response = await fetch(
        `http://localhost:5000/boards/1/posts/${postId}`,
        {
          method: "DELETE"
        }
      );
    
      if (response.ok) {
        alert("게시글이 성공적으로 삭제되었습니다.");
        navigate("/boards/study/posts");
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("게시글 삭제 중 오류 발생:", err);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleCommentPost = async () => {
    const authToken = localStorage.getItem("authToken");
    const commentContent = inputValue;
  
    if (!authToken) {
      throw new Error("User is not authenticated.");
    }
  
    if (!commentContent) {
      throw new Error("Please enter a comment.");
    }
  
    const commentData = {
      content: commentContent,
      userId: id,  
      postId: postId,  
      parentId: parentId || null,  // 대댓글인 경우 부모 댓글 ID 포함
    };
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
          body: JSON.stringify(commentData),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to post the comment.");
      }
  
      const data = await response.json();
      setComments((prevComments) => [...prevComments, data.comment]);
      setInputValue("");  // 댓글 입력란 초기화
      setParentId(null);  // 댓글 작성 후 parentId 초기화
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    }
  };

  const handleEditPost = async () => {
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken) {
      throw new Error("User is not authenticated.");
    }

    if (!editedTitle || !editedContent) {
      throw new Error("Both title and content are required.");
    }

    const updatedPost = {
      title: editedTitle,
      content: editedContent,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/boards/1/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
          body: JSON.stringify(updatedPost),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update the post.");
      }

      const data = await response.json();
      setPost(data.post); // Update the post data after successful update
      setIsEditMode(false); // Exit edit mode
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTitle(post?.title || '');
    setEditedContent(post?.content || '');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="w-screen h-[1000px] p-4 justify-center items-center">
      <Card className="w-[1200px] h-[600px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex">
            {isEditMode ? (
              <Input 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)} 
                placeholder="Enter the title"
              />
            ) : (
              post.title
            )}
            {post.userId === id && !isEditMode && (
              <div className='justify-self-end'>
                <Button className="bg-blue-500 text-white" onClick={() => setIsEditMode(true)}>
                  Edit Post
                </Button>
                <Button className="bg-red-500 text-white" onClick={handleDeletePost}>
                  Delete Post
                </Button>
              </div>
            )}
            {isEditMode && (
              <div className="mt-4">
                <Button className="bg-green-500 text-white" onClick={handleEditPost}>
                  Save Changes
                </Button>
                <Button className="bg-gray-500 text-white" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <textarea
              className="w-full h-40 border border-gray-300 p-2 rounded"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Enter the content"
            />
          ) : (
            <p className="text-lg">{post.content}</p>
          )}
        </CardContent>
      </Card>
      <div className="w-screen p-4 justify-center items-center">
        <h3 className="w-[1100px] justify-center items-center mx-auto text-xl font-bold mt-5">Comments</h3>
        {comments.length > 0 ? (
          <div className="mt-4 w-[1200px] justify-center items-center mx-auto">
            {comments.map(comment => (
              <div key={comment._id} className="p-4 border border-gray-300 rounded-md mb-4">
                <p className="font-semibold">User {comment.userId}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
                <p>{comment.content}</p>
                {comment.userId === id && (
                  <div className="mt-4">
                    <Button className="bg-red-500 text-white" onClick={() => handleDeleteComment(comment._id)}>
                      Delete Comment
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className='w-[1200px] justify-center items-center mx-auto mt-5'>No comments yet.</p>
        )}
      </div>
      <div className='flex w-[1200px] mx-auto pb-24'>
        <Input 
          placeholder="Leave a comment!" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          className='w-[600px] place-self-start ml-4 mr-10'
        />
        <Button onClick={handleCommentPost}>Post</Button>
      </div>
    </div>
  );
}

export default ViewPost;
