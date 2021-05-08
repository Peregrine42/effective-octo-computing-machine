select users.username as username, string_agg(CAST(roles.authority as text), ',')as authorities from users
left join roles on roles.username = users.username
group by users.username