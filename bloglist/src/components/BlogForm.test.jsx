import {render, screen} from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog}/>)
  const testBlog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'test.testing.es'
  }

  const sendButton = screen.getByText('create')

  await user.type(screen.getByPlaceholderText('write blog title here'), testBlog.title)
  await user.type(screen.getByPlaceholderText('write blog author here'), testBlog.author)
  await user.type(screen.getByPlaceholderText('write blog url here'), testBlog.url)
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('Component testing is done with react-testing-library')
  expect(createBlog.mock.calls[0][0].author).toBe('Test Author')
  expect(createBlog.mock.calls[0][0].url).toBe('test.testing.es')
})