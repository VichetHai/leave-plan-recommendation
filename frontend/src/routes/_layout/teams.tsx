import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { TeamsService } from "@/client/TeamsService"
import AddTeam from "@/components/Team/AddTeam"
import { TeamActionsMenu } from "@/components/Common/TeamActionsMenu"
import PendingTeams from "@/components/Pending/PendingTeams"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"

const teamsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getTeamsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      TeamsService.readTeams({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["teams", { page }],
  }
}

export const Route = createFileRoute("/_layout/teams")({
  component: Teams,
  validateSearch: (search) => teamsSearchSchema.parse(search),
})

function TeamsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getTeamsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })
  const setPage = (page: number) => {
    navigate({ to: "/teams", search: (prev) => ({ ...prev, page }) })
  }
  const teams = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0
  if (isLoading) return <PendingTeams />
  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Desc</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Owner</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Members</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teams?.map((team) => (
            <Table.Row key={team.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{team.name}</Table.Cell>
              <Table.Cell>{team.description || ""}</Table.Cell>
              <Table.Cell>{team.full_name || team.email || team.team_owner_id}</Table.Cell>
              <Table.Cell>{team.team_members?.length ?? 0}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={team.is_active ? "green" : "gray"}>
                  {team.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <TeamActionsMenu team={team} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Teams() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>Teams Management</Heading>
      <AddTeam />
      <TeamsTable />
    </Container>
  )
}
