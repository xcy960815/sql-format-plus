import type { SqlDialect } from './sql-format-plus'

export type QueryExample = {
  label: string
  labelZh: string
  language: SqlDialect
  query: string
}

export const queryExamples: QueryExample[] = [
  {
    label: 'Basic filtering',
    labelZh: '基础筛选',
    language: 'sql',
    query:
      'SELECT supplier_name, city FROM suppliers WHERE supplier_id > 500 ORDER BY supplier_name ASC, city DESC;',
  },
  {
    label: 'JOIN with aggregation',
    labelZh: '连接与聚合',
    language: 'sql',
    query:
      'SELECT c.customer_id, c.name, COUNT(o.id) AS order_count, SUM(o.total) AS total_spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE c.status = @status GROUP BY c.customer_id, c.name HAVING SUM(o.total) > 1000 ORDER BY total_spend DESC;',
  },
  {
    label: 'CTE and window function',
    labelZh: 'CTE 与窗口函数',
    language: 'sql',
    query:
      'WITH ranked_orders AS (SELECT customer_id, order_date, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn FROM orders WHERE order_date >= ?), active_customers AS (SELECT id, name FROM customers WHERE deleted_at IS NULL) SELECT ac.name, ro.order_date, ro.total FROM active_customers ac JOIN ranked_orders ro ON ro.customer_id = ac.id WHERE ro.rn = 1;',
  },
  {
    label: 'N1QL nested data',
    labelZh: 'N1QL 嵌套数据',
    language: 'n1ql',
    query:
      'SELECT airline.name, route.destinationairport, COUNT(*) AS route_count FROM `travel-sample` airline UNNEST airline.routes AS route WHERE airline.type = "airline" AND route.sourceairport = "SFO" GROUP BY airline.name, route.destinationairport ORDER BY route_count DESC LIMIT 10;',
  },
  {
    label: 'DB2 pagination',
    labelZh: 'DB2 分页',
    language: 'db2',
    query:
      'SELECT employee_id, first_name, last_name, department_id FROM employees WHERE department_id IN (SELECT department_id FROM departments WHERE location_id = :location) ORDER BY last_name FETCH FIRST 25 ROWS ONLY;',
  },
  {
    label: 'PL/SQL block',
    labelZh: 'PL/SQL 程序块',
    language: 'pl/sql',
    query:
      "BEGIN FOR item IN (SELECT id, status FROM orders WHERE status = 'PENDING') LOOP UPDATE orders SET status = 'PROCESSING', updated_at = SYSDATE WHERE id = item.id; END LOOP; COMMIT; END;",
  },
]
