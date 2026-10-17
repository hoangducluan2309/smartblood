import { sequelize, authenticateDatabase } from '../config/database.js';

async function inspectConstraints() {
  await authenticateDatabase();
  const [constraints] = await sequelize.query(`
    SELECT 
        tc.TABLE_SCHEMA,
        tc.TABLE_NAME, 
        tc.CONSTRAINT_NAME, 
        tc.CONSTRAINT_TYPE
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    WHERE tc.TABLE_NAME = 'NguoiDung'
  `);
  console.table(constraints);

  const [indexes] = await sequelize.query(`
    SELECT 
        i.name AS index_name,
        i.type_desc,
        i.is_unique,
        i.has_filter,
        i.filter_definition
    FROM sys.indexes i
    JOIN sys.objects o ON i.object_id = o.object_id
    WHERE o.name = 'NguoiDung'
  `);
  console.table(indexes);

  await sequelize.close();
}

inspectConstraints();
