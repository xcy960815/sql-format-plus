import sqlFormatter from './sql-format-plus'
import type { SqlDialect } from './sql-format-plus'

type QueryExample = {
  label: string
  language: SqlDialect
  query: string
}

const examples: QueryExample[] = [
  {
    label: 'Basic filtering',
    language: 'sql',
    query:
      'SELECT supplier_name, city FROM suppliers WHERE supplier_id > 500 ORDER BY supplier_name ASC, city DESC;',
  },
  {
    label: 'JOIN with aggregation',
    language: 'sql',
    query:
      'SELECT c.customer_id, c.name, COUNT(o.id) AS order_count, SUM(o.total) AS total_spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE c.status = @status GROUP BY c.customer_id, c.name HAVING SUM(o.total) > 1000 ORDER BY total_spend DESC;',
  },
  {
    label: 'CTE and window function',
    language: 'sql',
    query:
      'WITH ranked_orders AS (SELECT customer_id, order_date, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn FROM orders WHERE order_date >= ?), active_customers AS (SELECT id, name FROM customers WHERE deleted_at IS NULL) SELECT ac.name, ro.order_date, ro.total FROM active_customers ac JOIN ranked_orders ro ON ro.customer_id = ac.id WHERE ro.rn = 1;',
  },
  {
    label: 'N1QL nested data',
    language: 'n1ql',
    query:
      'SELECT airline.name, route.destinationairport, COUNT(*) AS route_count FROM `travel-sample` airline UNNEST airline.routes AS route WHERE airline.type = "airline" AND route.sourceairport = "SFO" GROUP BY airline.name, route.destinationairport ORDER BY route_count DESC LIMIT 10;',
  },
  {
    label: 'DB2 pagination',
    language: 'db2',
    query:
      'SELECT employee_id, first_name, last_name, department_id FROM employees WHERE department_id IN (SELECT department_id FROM departments WHERE location_id = :location) ORDER BY last_name FETCH FIRST 25 ROWS ONLY;',
  },
  {
    label: 'PL/SQL block',
    language: 'pl/sql',
    query:
      "BEGIN FOR item IN (SELECT id, status FROM orders WHERE status = 'PENDING') LOOP UPDATE orders SET status = 'PROCESSING', updated_at = SYSDATE WHERE id = item.id; END LOOP; COMMIT; END;",
  },
]

const input = document.querySelector<HTMLTextAreaElement>('#sql-input')
const output = document.querySelector<HTMLElement>('#sql-output')
const language = document.querySelector<HTMLSelectElement>('#sql-language')
const indent = document.querySelector<HTMLSelectElement>('#sql-indent')
const example = document.querySelector<HTMLSelectElement>('#sql-example')

const MAX_SYNC_INPUT_LENGTH = 50000

const debounce = (fn: () => void, delay: number): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined

  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
  }
}

const syncExample = (selectedExample: QueryExample): void => {
  if (!input || !language) {
    return
  }

  input.value = selectedExample.query
  language.value = selectedExample.language
}

const render = (): void => {
  if (!input || !output || !language || !indent) {
    return
  }

  if (input.value.length > MAX_SYNC_INPUT_LENGTH) {
    output.textContent =
      'Input is too large for live formatting. Shorten the SQL or format it through the library API.'
    return
  }

  output.textContent = sqlFormatter.format(input.value, {
    language: language.value as SqlDialect,
    indent: indent.value,
  })
}

const debouncedRender = debounce(render, 200)

input?.addEventListener('input', debouncedRender)
language?.addEventListener('change', render)
indent?.addEventListener('change', render)
example?.addEventListener('change', () => {
  const selectedExample = examples[Number(example.value)]

  if (selectedExample) {
    syncExample(selectedExample)
    render()
  }
})

syncExample(examples[0])
render()
