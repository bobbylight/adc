import type { Meta, StoryObj } from "@storybook/react-vite";

import { App } from "./app";

const meta = {
  component: App,
  title: "App",
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
