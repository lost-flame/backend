-- DropForeignKey
ALTER TABLE "OrderPlace" DROP CONSTRAINT "OrderPlace_user_id_fkey";

-- AddForeignKey
ALTER TABLE "OrderPlace" ADD CONSTRAINT "OrderPlace_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
