import type { CollectionConfig } from "payload"

import { isSuperAdmin } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    hidden: ({ user }) => !isSuperAdmin(user), // only super-admins can see the Media collection in the admin
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
