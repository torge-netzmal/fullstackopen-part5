import {useState, useEffect, useRef} from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistappUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null;
  })


  const blogFormRef = useRef()


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    if (user?.token) blogService.setToken(user.token);
  }, [user?.token])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({username, password})

      window.localStorage.setItem(
        'loggedBloglistappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = async event => {
    event.preventDefault()

    window.localStorage.removeItem(
      'loggedBloglistappUser')
    window.localStorage.clear()
    blogService.setToken(null)

    setUser(null)
    setUsername('')
    setPassword('')

  }


  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService.create(blogObject).then(returnedBlog => {
      setBlogs(blogs.concat(returnedBlog))
      setSuccessMessage(
        `a new blog '${blogObject.title}' by ${blogObject.author} added`
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }).catch(error => {
      setErrorMessage(
        `Error while creating: '${error}'`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    })
  }

  const handleLike = (blog) => {
    blogService.update(blog.id, {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: (blog.likes ?? 0) + 1,
      user: blog.user?.id,
    }).then(response => {
      setBlogs(blogs.map(b => b.id === blog.id ? response : b)
      )
    })
  }

  const handleDelete = (blog) => {
    if (window.confirm(`Remove blog '${blog.title}' by ${blog.author}`)) {

      blogService.remove(blog.id).then(() => {
        setBlogs(blogs.filter(b => b.id !== blog.id))
      }).catch(() => {
        setErrorMessage(
          `Unable to delete blog '${blog.title}' by ${blog.author}`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
    }
  }

  const loginForm = () => (
    <LoginForm
      username={username}
      password={password}
      handleUsernameChange={({target}) => setUsername(target.value)}
      handlePasswordChange={({target}) => setPassword(target.value)}
      handleSubmit={handleLogin}
    />
  )

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage} notificationType='error'/>
      <Notification message={successMessage} notificationType='success'/>
      {!user && loginForm()}
      {user && (<p>{user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>)}

      {user && (
        <Togglable buttonLabelShow='create new blog' buttonLabelHide='cancel' ref={blogFormRef}>
          <h2>create new</h2>
          <BlogForm createBlog={addBlog}/>
        </Togglable>
      )}
      {user && blogs.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} user={user} handleDelete={handleDelete}/>
      )}
    </div>
  )
}

export default App