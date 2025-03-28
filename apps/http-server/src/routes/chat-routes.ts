import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { auth } from '../middleware/auth-middleware';
import { prisma } from '@repo/db';
import { randomUUIDv7 as uuidv7 } from 'bun';

const router = Router();

router.post(
  '/room',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, avatar } = req.body;
    const userId = req.userId;
    try {
      let avatarUrl: string = avatar;
      if (!avatar) {
        avatarUrl = 'default image';
      }

      if (!name) {
        res.status(400).json({
          message: 'Room name and avatar are required',
        });
        return;
      }

      const slug = uuidv7().replace(/-/g, '');

      console.log(slug, 'slug');

      const room = await prisma.room.create({
        data: {
          name,
          slug,
          avatar: avatarUrl,
          adminId: Number(userId),
        },
      });

      if (!room) {
        res.status(404).json({
          message: 'Failed to create room',
        });
        return;
      }

      res.status(200).json({
        message: 'Room created successfully',
        slug,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/room/:slug',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    const adminId = parseInt(req.userId!);

    console.log(slug, 'slug');

    try {
      const room = await prisma.room.delete({
        where: {
          slug,
          adminId,
        },
      });

      if (!room) {
        res.status(404).json({
          message: 'Failed to delete room',
        });
        return;
      }

      res.status(200).json({
        message: 'Room deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/room',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const availableRooms = await prisma.room.findMany({
        select: {
          name: true,
          slug: true,
          avatar: true,
        },
      });

      if (!availableRooms) {
        res.status(404).json({
          message: 'No rooms found',
        });
        return;
      }

      res.status(200).json({
        rooms: availableRooms,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
