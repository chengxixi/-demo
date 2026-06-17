FROM node:20-alpine AS build

WORKDIR /app

COPY feedback-management-prototype/package.json feedback-management-prototype/package-lock.json ./feedback-management-prototype/
RUN npm --prefix feedback-management-prototype ci

COPY feedback-management-prototype ./feedback-management-prototype
RUN npm --prefix feedback-management-prototype run build

FROM scratch AS output
COPY --from=build /app/feedback-management-prototype/dist /
