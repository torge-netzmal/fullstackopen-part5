import {useState, useEffect, useRef} from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
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
  const [user, setUser] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const blogFormRef = useRef()


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

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

  const handleTitleChange = (event) => {
    console.log(event.target.value)
    setNewTitle(event.target.value)
  }

  const handleAuthorChange = (event) => {
    console.log(event.target.value)
    setNewAuthor(event.target.value)
  }

  const handleUrlChange = (event) => {
    console.log(event.target.value)
    setNewUrl(event.target.value)
  }

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    }

    blogService.create(blogObject).then(returnedBlog => {
      setBlogs(blogs.concat(returnedBlog))
      setSuccessMessage(
        `a new blog '${newTitle}' by ${newAuthor} added`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
    }).catch(error => {
      setErrorMessage(
        `Error while creating: '${error}'`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
    })
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({target}) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({target}) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage} notificationType='error'/>
      <Notification message={successMessage} notificationType='success'/>
      {!user && loginForm()}
      {user && (<p>{user.name} logged <button onClick={handleLogout}>logout</button></p>)}

      {user && (
        <Togglable buttonLabel='create new blog' ref={blogFormRef}>
          <h2>create new</h2>
          <BlogForm addBlog={addBlog} handleTitleChange={handleTitleChange}
                    handleAuthorChange={handleAuthorChange} handleUrlChange={handleUrlChange}
                    newTitle={newTitle} newAuthor={newAuthor} newUrl={newUrl}/>
        </Togglable>
      )}
      {user && blogs.map(blog =>
        <Blog key={blog.id} blog={blog}/>
      )}
    </div>
  )
}

export default App