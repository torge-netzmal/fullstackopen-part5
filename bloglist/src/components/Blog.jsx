import {useState} from "react";

const Blog = ({blog, handleLike, user, handleDelete}) => {
  const [visible, setVisible] = useState(false)

  const showWhenVisible = {display: visible ? '' : 'none'}

  const toggleVisibility = () => {
    setVisible(!visible)
  }


  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleVisibility}>{visible ? "hide" : "view"}</button>
      </div>

      <div style={showWhenVisible}>
        <div>{blog.url}</div>
        <div>likes {blog.likes ?? 0}
          <button onClick={() => handleLike(blog)}>like</button>
        </div>
        <div>{blog.user?.name}</div>
        {user.username === blog.user?.username && (
          <button onClick={() => handleDelete(blog)}>remove</button>
        )}
      </div>
    </div>

  )
}
export default Blog