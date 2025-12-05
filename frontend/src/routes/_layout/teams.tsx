import { Badge, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
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
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [selectedTeam, setSelectedTeam] = useState<typeof teams[0] | null>(null)

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
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Owner Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Owner Email</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Members</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teams?.map((team) => (
            <Table.Row key={team.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{team.id}</Table.Cell>
              <Table.Cell>{team.name}</Table.Cell>
              <Table.Cell>{team.description || ""}</Table.Cell>
              <Table.Cell
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                onClick={() => setSelectedTeam(team)}
              >
                {team.team_owner?.full_name || team.full_name || team.team_owner_id}
              </Table.Cell>
              <Table.Cell>{team.team_owner?.email || team.email || ""}</Table.Cell>
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

      {/* Dialog to show owner details */}
      <DialogRoot
        size="xs"
        placement="center"
        open={selectedTeam !== null}
        onOpenChange={({ open }) => !open && setSelectedTeam(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Owner Details</DialogTitle>
          </DialogHeader>
          <DialogBody pb={4}>
            <Text fontWeight="bold" mb={1}>Name:</Text>
            <Text mb={3}>{selectedTeam?.team_owner?.full_name || selectedTeam?.full_name || "-"}</Text>
            <Text fontWeight="bold" mb={1}>Email:</Text>
            <Text mb={3}>{selectedTeam?.team_owner?.email || selectedTeam?.email || "-"}</Text>
            <Text fontWeight="bold" mb={1}>Owner ID:</Text>
            <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedTeam?.team_owner_id || "-"}</Text>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

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
