import { expect, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const createScheduleUrl = '/namespaces/default/schedules/create';

test.describe('Creates Schedule Successfully', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true, false, {
      customAttributes: {
        attributeOne: 'Keyword',
        attributeTwo: 'Keyword',
      },
    });
    await page.goto(createScheduleUrl);
  });

  test('fills out interval-based schedule and submits', async ({ page }) => {
    await page.getByTestId('schedule-name-input').fill('test');
    await page.getByTestId('schedule-type-input').fill('test');
    await page.getByTestId('schedule-workflow-id-input').fill('test');
    await page.getByTestId('schedule-task-queue-input').fill('test');
    await page.getByTestId('interval-tab').click();
    await page.getByTestId('days-input').fill('1');
    await page.getByTestId('hour-interval-input').fill('2');
    await page.getByTestId('minute-interval-input').fill('30');
    await page.getByTestId('second-interval-input').fill('0');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByTestId('loading')).toBeVisible();
  });

  test.describe('Multiple Inputs', () => {
    test('adds and removes input rows', async ({ page }) => {
      await expect(page.getByTestId('add-input')).toBeVisible();
      await expect(page.getByTestId('remove-input-0')).toBeHidden();

      await page.getByTestId('add-input').click();
      await expect(page.getByTestId('remove-input-0')).toBeVisible();
      await expect(page.getByTestId('remove-input-1')).toBeVisible();

      await page.getByTestId('remove-input-1').click();
      await expect(page.getByTestId('remove-input-0')).toBeHidden();
    });

    test('does not duplicate editors after add -> remove -> add', async ({
      page,
    }) => {
      const editors = page.locator('[id^="input-"] .cm-content');

      await expect(editors).toHaveCount(1);

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);

      await page.getByTestId('remove-input-1').click();
      await expect(editors).toHaveCount(1);

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);
    });

    test('removing the first input keeps the correct remaining content', async ({
      page,
    }) => {
      const editors = page.locator('[id^="input-"] .cm-content');

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);

      await editors.nth(0).fill('"first"');
      await editors.nth(1).fill('"second"');

      await page.getByTestId('remove-input-0').click();

      await expect(editors).toHaveCount(1);
      await expect(editors.nth(0)).toHaveText('"second"');
    });
  });

  test('fills out schedule with custom search attributes and submits', async ({
    page,
  }) => {
    await page.getByTestId('schedule-name-input').fill('test');
    await page.getByTestId('schedule-type-input').fill('test');
    await page.getByTestId('schedule-workflow-id-input').fill('test');
    await page.getByTestId('schedule-task-queue-input').fill('test');
    await page.getByTestId('interval-tab').click();
    await page.getByTestId('days-input').fill('1');
    await page.getByTestId('hour-interval-input').fill('2');
    await page.getByTestId('minute-interval-input').fill('30');
    await page.getByTestId('second-interval-input').fill('0');

    await page.getByTestId('workflows-tab').click();
    const workflowsTab = page.getByTestId('workflows-panel');
    await expect(
      workflowsTab.getByTestId('add-search-attribute-button'),
    ).toBeEnabled();
    await workflowsTab.getByTestId('add-search-attribute-button').click();
    await expect(
      workflowsTab.getByTestId('search-attribute-select-button'),
    ).toBeEnabled();
    await workflowsTab.getByTestId('search-attribute-select-button').click();
    await expect(
      workflowsTab.getByRole('option', { name: 'attributeOne' }),
    ).toBeVisible();
    await workflowsTab.getByRole('option', { name: 'attributeOne' }).click();
    await workflowsTab
      .getByTestId('custom-search-attribute-value')
      .fill('workflow-value');

    await page.getByTestId('schedule-tab').click();
    const scheduleTab = page.getByTestId('schedule-panel');
    await expect(
      scheduleTab.getByTestId('add-search-attribute-button'),
    ).toBeEnabled();
    await scheduleTab.getByTestId('add-search-attribute-button').click();
    await expect(
      scheduleTab.getByTestId('search-attribute-select-button'),
    ).toBeEnabled();
    await scheduleTab.getByTestId('search-attribute-select-button').click();

    await scheduleTab.getByRole('option', { name: 'attributeTwo' }).click();
    await scheduleTab
      .getByTestId('custom-search-attribute-value')
      .fill('schedule-value');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByTestId('loading')).toBeVisible();
  });
});
