import { router, publicProcedure } from '../trpc'

export const propertyRouter = router({
  // Get the single property for this site
  get: publicProcedure.query(async ({ ctx }) => {
    const property = await ctx.prisma.property.findFirst({
      where: {
        isActive: true,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        amenities: true,
        reviews: {
          where: { isPublished: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return property
  }),
})
