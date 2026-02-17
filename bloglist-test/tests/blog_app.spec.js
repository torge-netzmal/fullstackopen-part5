const {test, describe, expect, beforeEach} = require('@playwright/test')
const {createBlog, loginWith} = require('./helper')

describe('Bloglist app', () => {
  beforeEach(async ({page, request}) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Torchi Torch',
        username: 'torch',
        password: 'root123321'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({page}) => {
    await expect(page.getByRole('textbox', {name: 'username'})).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'password'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'login'})).toBeVisible();
  })

  test('login fails with wrong password', async ({page}) => {
    await loginWith(page, 'mluukkai', 'wrong')

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong username or password')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

    await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
  })

  test('user can log in', async ({page}) => {
    await loginWith(page, 'mluukkai', 'salainen')
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  describe('When logged in', () => {
    beforeEach(async ({page}) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new blog can be created', async ({page}) => {
      await createBlog(page, "Testblog", "Tester", "www.testing.de/blog1")
      await expect(page.getByText(`Testblog Tester`, {exact: false})).toBeVisible()
    })

    describe('... and a blog exists', () => {
      beforeEach(async ({page}) => {
        await createBlog(page, "Testblog", "Tester", "www.testing.de/blog1")

      })

      test('a blog can be liked', async ({page}) => {
        await page.getByRole('button', {name: 'view'}).click()
        await page.getByRole('button', {name: 'like'}).click()
        await expect(page.getByText(`likes 1`)).toBeVisible()
      })

      test('a blog can be removed', async ({page}) => {
        await page.getByRole('button', {name: 'view'}).click()
        page.once('dialog', dialog => {
          console.log(`Dialog message: ${dialog.message()}`);
          dialog.dismiss().catch(() => {
          });
        });
        await page.getByRole('button', {name: 'remove'}).click();
      })

      test('... but not by another user', async ({page}) => {
        await page.getByRole('button', {name: 'logout'}).click()
        await loginWith(page, 'torch', 'root123321')
        await page.getByRole('button', {name: 'view'}).click()
        await expect(await page.getByRole('button', {name: 'remove'})).not.toBeVisible()
      })
    })

    describe("and multiple blog exists, with various likes", async () => {

      beforeEach(async ({page}) => {
        await createBlog(page, "Testblog1", "TesterA", "www.testing.de/blog1")
        const blog1 = page.getByText('Testblog1 TesterA', {exact: false}).locator('..')
        await blog1.getByRole('button', {name: 'view'}).click()
        await blog1.getByRole('button', {name: 'like'}).click()
        await blog1.getByRole('button', {name: 'like'}).click()
        await blog1.getByRole('button', {name: 'like'}).click()
        await createBlog(page, "Testblog2", "TesterA", "www.testing.de/blog2")
        const blog2 = page.getByText('Testblog2 TesterA', {exact: false}).locator('..')
        await blog2.getByRole('button', {name: 'view'}).click()
        await blog2.getByRole('button', {name: 'like'}).click()

        await createBlog(page, "Testblog3", "TesterA", "www.testing.de/blog3")
        const blog3 = page.getByText('Testblog3 TesterA', {exact: false}).locator('..')
        await blog3.getByRole('button', {name: 'view'}).click()
        await blog3.getByRole('button', {name: 'like'}).click()
        await blog3.getByRole('button', {name: 'like'}).click()
        await blog3.getByRole('button', {name: 'like'}).click()
        await blog3.getByRole('button', {name: 'like'}).click()
        await blog3.getByRole('button', {name: 'like'}).click()
        await createBlog(page, "Testblog4", "TesterB", "www.testing.de/blog4")
        const blog4 = page.getByText('Testblog4 TesterB', {exact: false}).locator('..')
        await blog4.getByRole('button', {name: 'view'}).click()
        await blog4.getByRole('button', {name: 'like'}).click()
        await blog4.getByRole('button', {name: 'like'}).click()

        await createBlog(page, "Testblog5", "TesterB", "www.testing.de/blog5")
        const blog5 = page.getByText('Testblog5 TesterB', {exact: false}).locator('..')
        await blog5.getByRole('button', {name: 'view'}).click()

        //order 3, 1, 4, 2, 5

      })

      test('...and they are ordered descendendly by the amount of likes', async ({page}) => {
        const res = await page.getByRole('button', {name: 'like'}).all()
        console.log(res)
        let current = 99
        for (const lbtn of res) {
          let text = await lbtn.locator('..').getByText("likes", {exact: false}).innerText()
          const no = parseInt(text
            .replaceAll('likes', '')
            .replaceAll('like', '')
            .trim())

          expect(current).toBeGreaterThanOrEqual(no)
          current = no
        }
      })

    })

  })
  /*  test('front page can be opened', async ({page}) => {
      const locator = page.getByText('Notes')
      await expect(locator).toBeVisible()
      await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2026')).toBeVisible()
    })

    test('login fails with wrong password', async ({page}) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong credentials')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })

    test('user can log in', async ({page}) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })


    describe('when logged in', () => {
      beforeEach(async ({page}) => {
        await loginWith(page, 'mluukkai', 'salainen')
      })

      test('a new note can be created', async ({page}) => {
        await createNote(page, 'a note created by playwright', true)
        await expect(page.getByText('a note created by playwright')).toBeVisible()
      })

      describe('and several notes exists', () => {
        beforeEach(async ({page}) => {
          await createNote(page, 'first note')
          await createNote(page, 'second note')
          await createNote(page, 'third note')
        })

        test('one of those can be made nonimportant', async ({page}) => {
          const otherNoteText = page.getByText('second note')
          const otherNoteElement = otherNoteText.locator('..')

          await otherNoteElement.getByRole('button', {name: 'make not important'}).click()
          await expect(otherNoteElement.getByText('make important')).toBeVisible()
        })
      })
    })*/
})