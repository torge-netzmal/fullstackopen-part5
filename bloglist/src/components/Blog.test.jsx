import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'


test('renders content', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'test.testing.es'
  }
  const user = {
    username: 'test',
  }

  render(<Blog blog={blog} user={user}/>)
  const titleElement = screen.getByText(blog.title, {exact: false})
  expect(titleElement).toBeVisible()
  const authorElement = screen.getByText(blog.author, {exact: false})
  expect(authorElement).toBeVisible()

  const urlElement = screen.getByText(blog.url)
  expect(urlElement).not.toBeVisible()

})

test('renders url and likes after clicking "view"', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'test.testing.es'
  }
  const userObject = {
    username: 'test',
  }

  render(<Blog blog={blog} user={userObject}/>)


  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const urlElement = screen.getByText(blog.url)
  expect(urlElement).toBeVisible()
  const likeElement = screen.getByText("likes", {exact: false})
  expect(likeElement).toBeVisible()
})

test('like handler is handled correctly (once per click)', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'test.testing.es'
  }
  const userObject = {
    username: 'test',
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} user={userObject} handleLike={mockHandler}/>)


  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)
  const likeButton = screen.getByText("like")
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})