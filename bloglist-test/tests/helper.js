const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', {name: 'login'}).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', {name: 'create new blog'}).click();
  await page.getByRole('textbox', {name: 'write blog title here'}).fill(title);
  await page.getByRole('textbox', {name: 'write blog author here'}).fill(author);
  await page.getByRole('textbox', {name: 'write blog url here'}).fill(url);
  await page.getByRole('button', {name: 'create'}).click();
  await page.getByText(`a new blog '${title}' by ${author} added`, {exact: false}).waitFor()
}

export {loginWith, createBlog}